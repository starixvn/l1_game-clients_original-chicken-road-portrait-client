import gc from "@sg/game-client-base";
import { _decorator, Animation, Button, EventKeyboard, input, Input, KeyCode, Label, Node, sp, v3 } from "cc";
import { AudioUtils } from "db://shared-components/game/audios/utils";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { AudioIds } from "../../../../audios/AudioIds";
import { Chicken } from "../../chicken/chicken";
import { AutoPlayHandler, AutoPlayStore } from "../../play-mode/auto-play";
import { BetHandler } from "../bet-handler";
import { BetStore, BetUIState } from "../bet-store";

const { ccclass, property } = _decorator;
const { handle, render } = Observer;

@ccclass
export default class PlaceBetButton extends ObserverComponent {
    @property(Node)
    cashOutButton: Node = null;

    @property(Node)
    startBetButton: Node = null;

    @property(Node)
    hitStoneButton: Node = null;

    @property(Label)
    lblMoney: Label = null;

    @property(sp.Skeleton)
    chickenEffect: sp.Skeleton = null;

    @property(Node)
    debugNode: Node = null;

    @property(Chicken)
    chickenCtrl: Chicken = null;

    @property(Node)
    playModeNode: Node = null;

    private isAutoPlay = false;

    private uiState: BetUIState = BetUIState.Start;

    onLoad() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        super.onLoad();
    }

    onKeyDown(event: EventKeyboard) {
        if (event.keyCode === KeyCode.SPACE) {
            this.onClickSpace();
        }
    }

    private onClickSpace() {
        if (this.uiState === BetUIState.Animating || this.uiState === BetUIState.Settle || this.isAutoPlay) {
            return;
        }
        this.onClickBetButton();
    }

    @handle(BetHandler, (handler) => handler.handle())
    onBet() { }

    onClickStartBet() {
        this.playSound(AudioIds.BTN_START);
        this.onBet();
    }

    @handle(BetHandler, (handler) => handler.handleCashOut())
    onClickCashOut() {
        this.playSound(AudioIds.BTN_CASHOUT);
        this.setActiveButton(this.cashOutButton, false);
        this.setActiveButton(this.hitStoneButton, false);
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    playSound(id: string) {
        return id;
    }

    @render(BetStore, (store) => store.eventUpdateWinAmount)
    updateCashOutValue(eventUpdateWinAmount: { winAmount: number }) {
        if (!eventUpdateWinAmount) {
            return;
        }
        this.lblMoney.string = gc.FormatUtils.numberWithCommas(eventUpdateWinAmount.winAmount, 2, true);
    }

    onClickBetButton() {
        if (this.uiState === BetUIState.Mining) {
            AudioUtils.playSFX(AudioIds.BTN_START);
            this.onBet();
        }
    }

    getBetUIStateString(uiState: BetUIState) {
        switch (uiState) {
            case BetUIState.Start:
                return "Start";
            case BetUIState.Mining:
                return "Mining";
            case BetUIState.Settle:
                return "Settle";
            case BetUIState.Animating:
                return "Animating";
        }
        return "Unknown";
    }

    @render(BetStore, (store) => store.uiState, { fireImmediately: false })
    updateUIState(uiState: BetUIState) {
        this.uiState = uiState;
        this.updateButtonInteractable(uiState);
        this.updateButtonState();
    }

    @handle(AutoPlayHandler, (handle) => handle.cancelAutoPlay())
    cancelAutoPlay() { }

    @handle(AutoPlayHandler, (handle) => handle.checkAutoBetNextRound())
    checkAutoBetNextRound() { }

    @render(AutoPlayStore, (store) => store.isAutoplay)
    renderAutoPlay(isAutoPlay: boolean) {
        this.isAutoPlay = isAutoPlay;
        this.updateButtonState();
    }

    private updateButtonState() {
        const uiState = this.uiState;
        const isAutoPlay = this.isAutoPlay;
        this.startBetButton.active = uiState === BetUIState.Start && !isAutoPlay;
        this.hitStoneButton.active = uiState > BetUIState.Start && !isAutoPlay;
        this.cashOutButton.active = uiState > BetUIState.Start && !isAutoPlay;

        this.playModeNode.active = uiState === BetUIState.Start || isAutoPlay;
    }

    @handle(AutoPlayHandler, (handle) => handle.countDownRoundAutoPlay())
    countDownRoundAutoPlay() { }

    updateButtonInteractable(uiState: BetUIState) {
        const buttonCashOut = this.cashOutButton.getComponent(Button);
        buttonCashOut.interactable = uiState === BetUIState.Mining;

        const hitStoneButton = this.hitStoneButton.getComponent(Button);
        hitStoneButton.interactable = uiState === BetUIState.Mining;

        const animation = this.lblMoney.getComponent(Animation);
        if (animation) {
            if (buttonCashOut.interactable) {
                animation.play();
            } else {
                animation.stop();
                this.lblMoney.node.scale = v3(1, 1, 1);
            }
        }
    }

    setActiveButton(button: Node, active: boolean) {
        button.getComponent(Button).interactable = active;
    }
}
