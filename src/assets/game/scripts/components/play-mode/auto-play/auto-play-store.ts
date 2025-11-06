import inversify from "inversify";
import mobx from "mobx";
import { FixedStepsMultiplierConfig } from "../../../game-configs/instant-win-config-store";
const { injectable, inject } = inversify;

@injectable()
export class AutoPlayStore {
    constructor() {
        mobx.makeAutoObservable(this);
    }

    public roundsList = [3, 30, 50, 80, 100, 200, 500, 1000];
    public isOpenAutoplayPopup = false;
    public selectedRoundOnPopup = this.roundsList[0];
    public roundsAutoplay = 0;

    clickEvent = {};

    triggerPlaceBetFailed = null;
    isAutoplay = false;
    noOfLanes = 1;
    currentMultiplierConfig: FixedStepsMultiplierConfig = null;

    get canIncreaseNoOfLanes() {
        return this.noOfLanes < this.currentMultiplierConfig.multiplierSteps.length;
    }

    get canDecreaseNoOfLanes() {
        return this.noOfLanes > 1;
    }

    resetAutoSelection() {
        this.noOfLanes = 1;
        this.selectedRoundOnPopup = this.roundsList[0];
    }

    triggerClickEvent(name: string) {
        this.clickEvent = { name };
    }
}
