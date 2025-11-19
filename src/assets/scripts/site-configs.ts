import gc from "@sg/game-client-base";

declare global {
    interface Window {
        envConfig: gc.Configs.SiteConfigs;
        crossConfig: gc.Configs.SiteConfigs;
    }
}

const defaultConfig: gc.Configs.SiteConfigs = {
    isDev: false, // if this property is true, then you should add token=anything into the querytring to sso to the game http://localhost:7456/?token=anything
    systemType: "VG",
    serverDomainMapper: {
        localhost: "lumigame.com",
    },
    ssl: true,
    subDomain: "l2-proxy",
    env: "DEV",
    subGuideDomain: "l2-guide-1",
    SGConnectSubDomain: "connectsite",
    enableMsgpackParserAllGames: false,
    enableMsgpackParserOnNotification: false,
    websocket: {
        proxyPath: "chickenroad",
        route: "chickenroad",
    },
    tolgeeUrl: "",
    sentry: {
        dsn: "https://9c999f9b51e3b4543cb160b946b5bcbe@sentry-k8s.lumigame.com/30",
        browserUrl: "https://browser.sentry-cdn.com/10.5.0/bundle.min.js",
        urlHash: "sha384-SAsRvjfAFRX3iwi3MG6ToeZNJVpHcRXKcITfFVLQipWK3uQ8SakuVmHDoSR3YNmJ",
        ignoreErrors: [],
    },
};

let configDev = {
    isDev: defaultConfig.isDev,
    userServiceUrlDev: defaultConfig.userServiceUrlDev,
    serverDomainMapper: defaultConfig.serverDomainMapper,
    notificationServiceUrlDev: defaultConfig.notificationServiceUrlDev,
};

if (window.envConfig) {
    configDev = {
        isDev: undefined,
        userServiceUrlDev: undefined,
        serverDomainMapper: undefined,
        notificationServiceUrlDev: undefined,
    };
}

export const siteConfigs: gc.Configs.SiteConfigs =
    window.envConfig && window.envConfig.isDev
        ? defaultConfig
        : { ...defaultConfig, ...configDev, ...window.envConfig, ...window.crossConfig };

window.envConfig = siteConfigs;
gc.Shared.utils.StorageManager.setPrefixKey(siteConfigs.storagePrefixKey);
