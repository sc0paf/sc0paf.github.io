/**
 * @module
 * @hidden
 */
import { main } from "data/projEntry";
import { createCumulativeConversion } from "features/conversion";
import { createHotkey } from "features/hotkey";
import { createReset } from "features/reset";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createResource, trackBest, trackTotal } from "features/resources/resource";
import { createResourceTooltip } from "features/trees/tree";
import player from "game/player";
import { createLayer } from "game/layers";
import type { DecimalSource } from "util/bignum";
import { render, Renderable, renderCol, renderRow } from "util/vue";
import { addTooltip } from "wrappers/tooltips/tooltip";
import { createLayerTreeNode, createResetButton } from "../common";
import { createInfobox } from "features/infoboxes/infobox";
import { DefaultValue, noPersist, Persistent, persistent } from "game/persistence";
import { createAction } from "features/clickables/action";
import Decimal from "util/bignum";
import { createRepeatable } from "features/clickables/repeatable";
import { CostRequirementOptions, createCostRequirement, displayRequirements } from "game/requirements";
import Formula from "game/formulas/formulas";
import { computed, ref, unref, Ref } from "vue";
import { createClickable } from "features/clickables/clickable";
import { JsxElement } from "typescript";
import { createUpgrade } from "features/clickables/upgrade";
import { l } from "vite/dist/node/types.d-aGj9QkWt";
import { loadingSave } from "util/save";

import frame1 from "./assets/01.png";
import frame2 from "./assets/02.png";
import frame3 from "./assets/03.png";
import frame4 from "./assets/04.png";
import frame5 from "./assets/05.png";
import frame6 from "./assets/06.png";
import frame7 from "./assets/07.png";
import frame8 from "./assets/08.png";
import frame9 from "./assets/09.png";
import frame10 from "./assets/10.png";
import frame11 from "./assets/11.png";
import frame12 from "./assets/12.png";
import frame13 from "./assets/13.png";
import frame14 from "./assets/14.png";
import frame15 from "./assets/15.png";

interface CoinInstance {
	id: Persistent<string>;
	currentFrame: Persistent<number>;
	frameAccumulator: number;
	isFlipping: Persistent<boolean>;
	isHeads: Persistent<boolean | null>;
	flipTimer: Ref<number>;
	resultDisplayTimer: Persistent<number>;
	flipDuration: Persistent<number>;
	framesPerSecond: Persistent<number>;
	pointGainValue: Persistent<number>;
	flipChance: Persistent<number>;
	valueRepeatable: ReturnType<typeof createRepeatable>;
	flipSpeedRepeatable: ReturnType<typeof createRepeatable>;
	evRepeatable: ReturnType<typeof createRepeatable>;
	autoFlipUpgrade: ReturnType<typeof createUpgrade>;

}

const id = "$";
const layer = createLayer(id, layer => {
	const name = "Coins!";
	const color = "#A0724D";

	const points = createResource<DecimalSource>(0, "Cash");
	const coins = createResource<DecimalSource>(1, "Coins");
	const resultDisplayDuration: number = 5;

	const treeNode = createLayerTreeNode(() => ({
		layerID: id,
		color
	}))

	const repeatableStyles = {
		width: "100%",
		height: "50px",
		fontWeight: "normal",
		padding: "0px 10px",
		margin: "0px"
	}

	const bestCoins = trackBest(coins)
	const totalCoins = trackTotal(coins)

	const coinAnimationFrames = [frame1, frame3, frame5, frame7, frame9, frame11, frame5, frame14];

	const coinOutcome = (flipChance: number): boolean => (
		Math.random() < flipChance
	)

	function createCoin(id: string): CoinInstance {
		const coin = {} as CoinInstance; // Forward reference for upgrades

		coin.id = persistent<string>(id);
		coin.frameAccumulator = 0;
		coin.currentFrame = persistent<number>(0);
		coin.isFlipping = persistent<boolean>(false);
		coin.isHeads = persistent<boolean | null>(null);
		coin.flipTimer = ref(0);
		coin.resultDisplayTimer = persistent<number>(0);
		coin.flipDuration = persistent<number>(1);
		coin.framesPerSecond = persistent<number>(15);
		coin.pointGainValue = persistent<number>(1);
		coin.flipChance = persistent<number>(0.5);

		coin.valueRepeatable = createRepeatable(() => ({
			requirements: createCostRequirement((): CostRequirementOptions => ({
				cost: Formula.variable(coin.valueRepeatable.amount).pow_base(1.8).times(5),
				resource: noPersist(points)
			})),
			display: (): Renderable => (
				<>
					<u>Heads Payout +1</u><br />
					Current{coin.valueRepeatable.amount.value ? `[${unref(coin.valueRepeatable.amount)}]` : ''}: +${unref(coin.valueRepeatable.amount)}<br />
					{displayRequirements(coin.valueRepeatable.requirements)}
				</>
			),
			buttonStyle: repeatableStyles,
			style: { width: "100%" },
			visibility: () => unref(unlockValueRepeatable.bought)
		}));

		coin.flipSpeedRepeatable = createRepeatable(() => ({
			requirements: createCostRequirement(() => ({
				cost: Formula.variable(coin.flipSpeedRepeatable.amount).pow_base(1.5).times(5),
				resource: noPersist(points)
			})),
			onClick: () => {
				coin.flipDuration.value *= 0.9;
				coin.framesPerSecond.value *= 1.06;
			},
			display: () => (
				<>
					<u>Speed Up</u><br />
					Duration: {coin.flipDuration.value.toFixed(2)}s
				</>
			),
			buttonStyle: repeatableStyles,
			style: { width: "100%" },
			visibility: () => unref(unlockFlipSpeedRepeatable.bought)
		}));

		coin.evRepeatable = createRepeatable(() => ({
			requirements: createCostRequirement((): CostRequirementOptions => ({
				cost: Formula.variable(coin.evRepeatable.amount).pow_base(1.7).times(20),
				resource: noPersist(points)
			})),
			style: {
				width: "100%"
			},
			buttonStyle: repeatableStyles,
			display: (): Renderable => (
				<>
					<u>Heads Chance+</u><br />
					Current{coin.evRepeatable.amount.value ? `[${unref(coin.evRepeatable.amount)}]` : ''}: {Decimal.times(unref(coin.flipChance), 100).toFixed(0)}%<br />
					{displayRequirements(coin.evRepeatable.requirements)}
				</>
			),
			visibility: () => unref(unlockEVRepeatable.bought)
		}));

		coin.autoFlipUpgrade = createUpgrade(() => ({
			requirements: createCostRequirement((): CostRequirementOptions => ({
				cost: 1,
				resource: noPersist(coins)
			})),
			style: { width: "100%" },
			buttonStyle: repeatableStyles,
			display: (): Renderable => (
				<>
					<u>Autoflip</u><br />
					<i>No clicky 4 flippy</i><br />
					{displayRequirements(coin.autoFlipUpgrade.requirements)}
				</>
			),
			visibility: () => unref(unlockAutoFlip.bought),
		}))

		return coin;
	}

	
	const coinInstances: CoinInstance[] = [];

	// Make a placeholder for all possible interactive coins
	for (let i = 0; i < 8; i++) {
		coinInstances.push(createCoin(`${i}`));
	}

	// How many the player has unlocked
	const visibleCoins = computed(() => {
		return coinInstances.slice(0, Math.min(coins.value as number, 8))
	})

	// Unlock another coin
	const addCoin = createRepeatable(() => ({
		requirements: createCostRequirement(() => ({
			cost: Formula.variable(unref(coins) as number -1).pow_base(1.6).times(1000),
			resource: noPersist(points)
		})),
		visibility: true,
		onClick: () => {
			coins.value = Decimal.add(coins.value, 1);
			const newCoin = createCoin(`${coinInstances.length}`);
			coinInstances.push(newCoin);
		},
		display: {
			title: "Add a coin!",
			description: "Purchase a second coin."
		}
	}))

	const CoinDisplay = ({ coin, coinId }: { coin: CoinInstance, coinId: number }) => (
		<div style={{ width: "150px", margin: 0, padding: 0 }}>
			<img src={coin.isFlipping.value
				? coinAnimationFrames[coin.currentFrame.value]
				: (coin.isHeads.value ? frame1 : frame9)
			}
				onClick={() => {
					if (!coin.isFlipping.value && !loadingSave.value) {
						coin.isHeads.value = coinOutcome(coin.flipChance.value);

						coin.isFlipping.value = true;
						coin.flipTimer.value = 0;
						coin.resultDisplayTimer.value = 0;
					}
				}}
			/><br />
			{coin.isFlipping.value
				? "Flipping..."
				: (coin.isHeads.value !== null && coin.resultDisplayTimer.value < resultDisplayDuration)
					? (coin.isHeads.value ? "Heads!" : "Tails!")
					: "Click to flip!"
			}
			{renderCol(coin.valueRepeatable, coin.flipSpeedRepeatable, coin.evRepeatable, coin.autoFlipUpgrade)}
		</div>
	)

	const unlockValueRepeatable = createUpgrade(() => ({
		requirements: createCostRequirement(() => ({
			cost: 3,
			resource: noPersist(points)
		})),
		display: {
			title: "Extra Value",
			description: "Unlocks the value increase upgrade."
		}
	}))

	const unlockFlipSpeedRepeatable = createUpgrade(() => ({
		requirements: createCostRequirement((): CostRequirementOptions => ({
			cost: 15,
			resource: noPersist(points)
		})),
		visibility: () => unref(unlockValueRepeatable.bought),
		display: {
			title: "Flip Speed",
			description: "Unlocks the flip speed upgrade."
		}
	}))

	const unlockEVRepeatable = createUpgrade(() => ({
		requirements: createCostRequirement((): CostRequirementOptions => ({
			cost: 25,
			resource: noPersist(points)
		})),
		visibility: () => unref(unlockFlipSpeedRepeatable.bought),
		display: {
			title: "Tilt the Odds",
			description: "Unlocks the heads chance upgrade."
		}
	}))

	const unlockCoinTiers = createUpgrade(() => ({
		requirements: createCostRequirement((): CostRequirementOptions => ({
			cost: 100,
			resource: noPersist(points)
		})),
		visibility: () => unref(unlockEVRepeatable.bought),
		display: {
			title: "Coin Tiers",
			description: "Unlocks the ability to add more coins."
		}
	}))

	const unlockAutoFlip = createUpgrade(() => ({
		requirements: createCostRequirement((): CostRequirementOptions => ({
			cost: 1,
			resource: noPersist(coins)
		})),
		visibility: () => unref(unlockEVRepeatable.bought),
		display: {
			title: "Autoflip",
			description: "Time to stop clicking."
		}
	}))

	layer.on("update", diff => {
		coinInstances.forEach(coin => {
			if (coin.isFlipping.value) {
				coin.frameAccumulator += diff * unref(coin.framesPerSecond);
				while (coin.frameAccumulator >= 1) {
					coin.currentFrame.value = (coin.currentFrame.value + 1) % coinAnimationFrames.length;
					coin.frameAccumulator -= 1;
				}

				coin.flipTimer.value += diff;
				if (coin.flipTimer.value >= coin.flipDuration.value) {
					coin.isFlipping.value = false;
					coin.flipTimer.value = 0;
					coin.resultDisplayTimer.value = 0;
					if (coin.isHeads.value) {
						points.value = Decimal.add(points.value, Decimal.add(coin.pointGainValue.value, unref(coin.valueRepeatable.amount)))
					}
				}
			} else if (coin.isHeads.value !== null) {
				coin.resultDisplayTimer.value += diff;
			}

			if (coin.isHeads.value !== null && coin.resultDisplayTimer.value >= resultDisplayDuration) {
				coin.isHeads.value = null;
			}
		})
	})




	return {
		name,
		color,
		points,
		coins,
		coinInstances,
		bestCoins,
		totalCoins,
		CoinDisplay,
		addCoin,

		unlockValueRepeatable,
		unlockFlipSpeedRepeatable,
		unlockEVRepeatable,
		unlockCoinTiers,
		unlockAutoFlip,

		display: () => (
			<>
				<MainDisplay resource={points} color={color} />
				<MainDisplay resource={coins} color={color} />

				<div style={{
					display: "flex",
					flexWrap: "wrap",
					gap: "10px",
					justifyContent: "center",
					margin: "20px 0"
				}}>
					{/* {coinInstances.map((coin, index) => (
						<CoinDisplay key={coin.id.value} coin={coin} coinId={index} />
					))} */}
					{visibleCoins.value.map((coin, index) => (
    				<CoinDisplay key={coin.id.value} coin={coin} coinId={index} />
				))}
				</div>
				{renderRow(
					unlockValueRepeatable,
					unlockFlipSpeedRepeatable,
					unlockEVRepeatable,
					unlockCoinTiers,
					unlockAutoFlip
				)}

				{render(addCoin)}

			</>
		),
		treeNode,
	};
})

export default layer;