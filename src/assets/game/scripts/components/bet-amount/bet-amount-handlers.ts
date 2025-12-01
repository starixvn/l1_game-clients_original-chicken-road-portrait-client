import gc from "@sg/game-client-base";
import inversify from "inversify";
import { InstantWinConfigStore } from "../../game-configs/instant-win-config-store";
import { BetAmountStore } from "./bet-amount-store";

const { injectable, inject } = inversify;

@injectable()
export class BetAmountHandlers implements gc.Shared.IHandler<gc.GameServiceMessage.GameConfigs> {
    @inject(BetAmountStore) protected readonly betAmountStore: BetAmountStore;
    @inject(gc.Bet.BetStore) private readonly betStore: gc.Bet.BetStore;
    @inject(InstantWinConfigStore) private readonly gameConfig: InstantWinConfigStore;
    @inject(gc.Player.MainPlayerStore) private readonly mainPlayerStore: gc.Player.MainPlayerStore;

    private inputAmountKey = "";
    handle() { }

    get maxBetAvailable() {
        return Math.min(this.gameConfig.maxBet, this.mainPlayerStore.balance)
    }

    validAmount(amount: number) {
        let validAmount = Math.max(amount, this.gameConfig.minBet);
        validAmount = Math.min(validAmount, this.gameConfig.maxBet);
        return validAmount;
    }

    clickBetLevel(key: string) {
        const isChangeKey = this.inputAmountKey !== key;

        this.inputAmountKey = key;
        if (key === "max") {
            this.updateBetAmount(this.maxBetAvailable, false);
        } else {
            const amount = +key;
            if (isChangeKey) {
                this.updateBetAmount(amount)
            } else {
                const newAmount = this.betStore.amount + amount;
                this.updateBetAmount(newAmount);
            }
        }
    }

    setInputAmountKey(key: string) {
        this.inputAmountKey = key;
    }

    updateBetAmount(betAmount: number, validate = true) {
        const validAmount = validate ? this.validAmount(betAmount) : betAmount;
        if (validAmount !== this.betStore.amount) {
            this.betStore.amount = validAmount;
        } else {
            this.betAmountStore.syncAmount(validAmount);
        }
        this.updateStatusBetAmountPopup(false);
    }

    updateStatusBetAmountPopup(isOpen: boolean) {
        this.betAmountStore.isOpenBetAmountPopup = isOpen;
    }

    decreaseAmount() {
        const current = this.betStore.amount;
        const change = this.getChangeDescreaseBetAmount(current);
        this.betStore.amount = this.calculateNewBetAmount(current, change);
    }

    increaseAmount() {
        const current = this.betStore.amount;
        const change = this.getChangeInscreaseBetAmount(current);
        this.betStore.amount = this.calculateNewBetAmount(current, change);
    }

    multiplyBetAmount(multiplier: number) {
        const newAmount = this.betStore.amount * multiplier;
        const roundTo2DecimalAmount = +newAmount.toFixed(2);
        const [minBet, maxBet] = [this.gameConfig.minBet, this.gameConfig.maxBet];
        this.betStore.amount = Math.min(Math.max(roundTo2DecimalAmount, minBet), maxBet);
        this.setInputAmountKey("multiplyBet");
    }

    private calculateNewBetAmount(current: number, change: number): number {
        const [minBet, maxBet] = [this.gameConfig.minBet, this.gameConfig.maxBet];
        return Math.min(Math.max(current + change, minBet), maxBet);
    }

    private getChangeInscreaseBetAmount(current: number) {
        const BET_THRESHOLDS = [
            { threshold: 999999, increment: 1_000_000 },
            { threshold: 99999, increment: 100_000 },
            { threshold: 9999, increment: 10_000 },
            { threshold: 999, increment: 1_000 },
            { threshold: 99, increment: 100 },
            { threshold: 9, increment: 10 },
        ];

        return BET_THRESHOLDS.find(({ threshold }) => current > threshold)?.increment || 1;
    }

    private getChangeDescreaseBetAmount(current: number) {
        const BET_THRESHOLDS = [
            { threshold: 1000000, increment: 1_000_000 },
            { threshold: 100000, increment: 100_000 },
            { threshold: 10000, increment: 10_000 },
            { threshold: 1000, increment: 1_000 },
            { threshold: 100, increment: 100 },
            { threshold: 10, increment: 10 },
        ];

        return (BET_THRESHOLDS.find(({ threshold }) => current > threshold)?.increment || 1) * -1;
    }
}
