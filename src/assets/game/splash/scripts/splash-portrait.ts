import { _decorator, ProgressBar } from "cc";
import Observer from "observer";

import Splash from "db://shared-components/splash/scripts/components/splash";
import AutoTestSplash from "db://shared-components/shared/common-components/auto-test/auto-test-splash";

const { ccclass } = _decorator;
const { observer } = Observer;

@ccclass
@observer
export default class SplashPortrait extends Splash {
    onLoad() {
        super.onLoad();
        this.addComponent(AutoTestSplash);
    }

    handleProgressIndex(progress: number) {
        super.handleProgressIndex(progress);
        if (progress > 0) {
            const progressBar = this.containerCustomize.children[0]?.getComponent(ProgressBar);
            progressBar && (progressBar.progress = progress);
        }
    }
}
