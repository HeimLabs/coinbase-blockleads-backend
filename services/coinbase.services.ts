import { Coinbase } from "@coinbase/coinbase-sdk";
import { Wallet } from "@coinbase/coinbase-sdk/dist/coinbase/wallet";
import fs from "fs";
import { transformConfig } from "../utils/coinbase.utils";

let cb: Coinbase = Coinbase.configureFromJson({ filePath: 'cdp_api_key.json' });

let _wallet: Wallet;
const wallet = () => _wallet;

const devSeedPath = "wallet_seed_test.json";
const prodSeedPath = "wallet_seed.json";

const setupWallet = async () => {
    try {
        const seedPath = process.env.APP_ENV == "production" ? prodSeedPath : devSeedPath;
        // If Wallet exists
        if (fs.existsSync(seedPath)) {
            console.log("[coinbase/setup] 🔄 Wallet exists, re-instantiating...");
            const seedData = transformConfig(seedPath);
            _wallet = await Wallet.import(seedData);
            console.log(`[coinbase/setup] ✅ Wallet re-instantiated: ${(await _wallet.getDefaultAddress()).getId()}`);
        }
        // Create Wallet
        else {
            _wallet = await Wallet.create({ networkId: process.env.APP_ENV == "production" ? Coinbase.networks.BaseMainnet : Coinbase.networks.BaseSepolia });
            const saveSeed = _wallet.saveSeed(seedPath);
            console.log("[coinbase/setup] ✅ Seed saved: ", saveSeed);
            console.log("[coinbase/setup] ✅ Wallet initialized: ", (await _wallet.getDefaultAddress()).getId());
        }
    } catch (err) {
        console.error("[coinbase/setup] ❌ Failed to setup Coinbase SDK");
        console.error(err);
        throw err;
    }
}

export { cb, setupWallet, wallet };