import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fileSystem from "node:fs";

// returns the absolute path to the preload script
function getPreloadPath() {
    return path.join(app.getAppPath(), 'src', 'electron', 'preload.js');
}

let winAmountPercentage = 0;
function getWinAmount() {
    return Math.round(getSumAmount(playerData) * winAmountPercentage);
}

let taxAmountPercentage = 0;
function getTaxAmount() {
    return Math.round(getSumAmount(playerData) * taxAmountPercentage);
}

export const defaultTranslations = {
    pl: {
        headerTitle: "Ruletka",
        drawIn: "Losowanie za:",
        notEnoughPlayers: "Za malo graczy",
        winAmount: "Do wygrania:",
        tax: "Podatek:",
        pool: "Pula:",
        rouletteStopped: "Ruletka wstrzymana",
        betsDisabled: "Zapisywanie zakladow wylaczone",
        winner: "Wygrany:",
        lastRoundResult: "Wynik ostatniej rundy:",
        lastWinner: "Ostatni wygrany:",
        noWinner: "Brak wygranego",
        lastWinAmount: "Wygrana kwota:",
        lastWinnerChance: "Szansa wygrania:",
        bestWinners: "Najlepsze wygrane dnia:",
        luckyGuys: "Najwieksi szczesciarze dnia:",
        chat: "Chat",
        topBets: "Pierwsze 30 najwiekszych zakladow:",
        placeBetBy: "Postaw zaklad przez:",
        betAmount: "<kwota>",
        amount: "Przelew:",
        chance: "Szansa:"
    },
    en: {
        headerTitle: "Roulette on",
        drawIn: "Draw in:",
        notEnoughPlayers: "Not enough players",
        winAmount: "To win:",
        tax: "Tax:",
        pool: "Pool:",
        rouletteStopped: "Roulette paused",
        betsDisabled: "Betting disabled",
        winner: "Winner:",
        lastRoundResult: "Last round result:",
        lastWinner: "Last winner:",
        noWinner: "No winner",
        lastWinAmount: "Winning amount:",
        lastWinnerChance: "Winning chance:",
        bestWinners: "Top wins of the day:",
        luckyGuys: "Luckiest players of the day:",
        chat: "Chat",
        topBets: "Top 30 biggest bets:",
        placeBetBy: "Bet via:",
        betAmount: "<amount>",
        amount: "Amount:",
        chance: "Chance:"
    }
};

async function ensureTranslationFile(language, defaults) {
    const filePath = path.join(app.getPath('appData'), 'RoulettePaymentTracker', `${language}.json`);
    try {
        await fileSystem.promises.access(filePath);
    } catch {
        await fileSystem.promises.mkdir(path.dirname(filePath), { recursive: true });
        await fileSystem.promises.writeFile(filePath, JSON.stringify(defaults, null, 2), "utf-8");
        console.log(`Created default translation file for ${language}`);
    }
}

async function getTranslations(language) {
    try {
        const filePath = path.join(app.getPath('appData'), 'RoulettePaymentTracker', `${language}.json`);
        await ensureTranslationFile(language, defaultTranslations[language] || defaultTranslations.pl);
        const raw = await fileSystem.promises.readFile(filePath, "utf-8");
        return JSON.parse(raw);
    } catch (err) {
        console.error("Translation error:", err);
        return defaultTranslations.pl;
    }
}

function sendTranslationsUpdate(translations) {
    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send("translations-update", translations);
    });
}

async function initConfig() {
    const config = await getViewerConfig();
    sendViewerConfigUpdate(config);

    taxAmountPercentage = (config.taxPercentage ?? 8) / 100;
    winAmountPercentage = 1 - taxAmountPercentage;

    const translations = await getTranslations(config.language || "pl");
    sendTranslationsUpdate(translations);
}


let mainWindow = null;

// creates the main application window and loads the frontend HTML
async function createWindow() {

    mainWindow = new BrowserWindow({
        width: 1670,
        height: 900,
        autoHideMenuBar: true, // hide the menu bar unless Alt is pressed
        resizable: false,
        minimizable: false,
        maximizable: false,
        webPreferences: {
            preload: getPreloadPath(), // preloads preload.js file
            contextIsolation: true, // isolates renderer context for security
            backgroundThrottling: false // disables Chromium’s background throttling
        }
    });

    // load the main HTML file into the window
    try {
        await mainWindow.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));
        console.log('Page loaded successfully');
    }
    catch (error) {
        console.log('Failed to load page: ' + error);
    }
}

// when Electron has finished initialization, create the window
app.on('ready', async () => {
    await createWindow();
    sendDashboardUpdate();

    createAppDataShortcut();

    const config = await getViewerConfig();
    sendViewerConfigUpdate(config);

    await initConfig();
})

app.on('before-quit', async () => {
    await clearJSONDataFile(winnerDataFilePath, "");
})

// paths to JSON files at AppData folder
let paymentDataFilePath = path.join(app.getPath('appData'), 'RoulettePaymentTracker', 'paymentData.json');
let winnerDataFilePath = path.join(app.getPath('appData'), 'RoulettePaymentTracker', 'winnerData.json')
let rouletteStatusFilePath = path.join(app.getPath('appData'), 'RoulettePaymentTracker', 'rouletteStatus.json')
let viewerConfigFilePath = path.join(app.getPath('appData'), 'RoulettePaymentTracker', 'viewerConfig.json');

async function getJSONFile(filePath) { // gets JSON file with payment data
    try {
        return fileSystem.promises.readFile(filePath, 'utf-8'); // read and return file content
    } catch (error) {
        console.log("Couldn't get access to the JSON file.");
        return "";
    }
}

function updateData(oldData, newData, key, equalityFunction, sortFunction) {
    const currentMap = new Map(oldData.map(item => [item[key], item])); // create a map for quick lookup of existing players by username

    let updatedData = [];

    // iterate over new player data
    newData.forEach(newItem => {
        const currentItem = currentMap.get(newItem[key]); // check if player exists in current data

        if (!currentItem) {  // new item
            updatedData.push(newItem);
        } else if (!equalityFunction(currentItem, newItem)) { // existing but changed
            updatedData.push(newItem);
        } else { // old item
            updatedData.push(currentItem);
        }
    });

    if (sortFunction) { // sorting updated data
        updatedData.sort(sortFunction);
    }

    const changed = updatedData.length !== oldData.length || updatedData.some((p, i) => p !== oldData[i]); // check if data changed by length or any player reference mismatch

    return changed ? updatedData : oldData;
}

// async function to clear JSON file content after winner is drawn
async function clearJSONDataFile(filePath, initialText) {
    try {
        await fileSystem.promises.writeFile(filePath, initialText, 'utf-8');
        console.log("Cleared data file:", filePath);
    } catch (error) {
        console.error("Failed to clear data file:", error);
    }
}

let playerData = [];
let playerCount = 0;
async function fetchPlayerData() {
    try {
        const jsonData = await getJSONFile(paymentDataFilePath);
        const playerDataArray = JSON.parse(jsonData);

        if (Array.isArray(playerDataArray)) {
            const equalityFunction = (oldData, newData) => newData.amount === oldData.amount;
            const sortFunction = (a, b) => b.amount - a.amount; // largest first
            playerData = updateData(playerData, playerDataArray, "username", equalityFunction, sortFunction);
            playerCount = playerData.length;
        } else {
            console.error('JSON is not an array');
            playerData = [];
        }
    } catch (error) {
        console.error("Error fetching or parsing data:", error);
        playerData = [];
    }

    return playerData;
}

function getSumAmount(data) { // collect sum of all payment amounts
    return data.reduce((acc, player) => acc + player.amount, 0); // return amount
}

// draws a winner
function getWinnerFromDraw() {
    const random = Math.random() * getSumAmount(playerData);

    let cumulative = 0;
    for (const player of playerData) {
        cumulative += player.amount;
        if (random < cumulative) {
            console.log("Winner: " + player.username);
            return player.username;
        }
    }
}

// async function to save winner info to a JSON file
async function saveWinnerToFile(winner, winAmount, filePath) {
    try {
        const winnerData = { username: winner, amount: winAmount };
        await fileSystem.promises.writeFile(filePath, JSON.stringify(winnerData), 'utf-8');
        console.log("Saved winner to file:", filePath);
    } catch (error) {
        console.error("Failed to save winner file:", error);
    }
}

let bestWinners = [];
function updateBestWinners(list, winner, winAmount, winChance) {
    list.push({ username: winner, amount: winAmount, chance: winChance });
    list.sort((a, b) => b.amount - a.amount);
}

let luckyGuys = [];
function updateLuckyGuys(list, winner, winAmount, winChance) {
    list.push({ username: winner, amount: winAmount, chance: winChance });
    list.sort((a, b) => a.chance - b.chance);
}

let setPlayerForRoulette = "";
ipcMain.on("set-roulette-for-player", (event, username) => {
    setPlayerForRoulette = username;
    console.log("Set roulette draw for the player: " + username);
});

ipcMain.handle('draw-the-winner', async () => {
    let winner;
    let winAmount = getWinAmount();
    let totalAmount = getSumAmount(playerData);

    if (setPlayerForRoulette === "") {
        winner = getWinnerFromDraw();
    }
    else {
        winner = setPlayerForRoulette;
    }

    if (winner) {
        await saveWinnerToFile(winner, winAmount, winnerDataFilePath);

        const player = playerData.find(player => player.username === winner);
        const winChance = player ? Number(((player.amount / totalAmount) * 100).toFixed(2)) : 0;

        updateBestWinners(bestWinners, winner, winAmount, winChance);
        updateLuckyGuys(luckyGuys, winner, winAmount, winChance);

        sendLastWinnerUpdate({ winner, winAmount, winChance });
        sendBestWinners(bestWinners);
        sendLuckyGuys(luckyGuys);

        await clearJSONDataFile(paymentDataFilePath, "[]");
        playerData = [];
        playerCount = 0;

        sendDashboardUpdate();

        setPlayerForRoulette = "";
    }

    return { winner, winAmount };
});

function sendLastWinnerUpdate({ winner, winAmount, winChance }) {
    const data = {
        lastWinner: winner,
        lastWinAmount: winAmount,
        lastWinnerChance: winChance
    };

    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('last-winner-update', data);
    });
}


function sendBestWinners(bestWinners) {
    const data = { winners: bestWinners.slice(0, 3) };

    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('best-winners-update', data);
    });
}

function sendLuckyGuys(luckyGuys) {
    const data = { winners: luckyGuys.slice(0, 3) };

    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('lucky-guys-update', data);
    });
}

let rouletteStatus = false;
async function fetchRouletteStatus() {
    try {
        const jsonData = await getJSONFile(rouletteStatusFilePath); // await the promise
        const rouletteData = JSON.parse(jsonData); // now this is safe
        rouletteStatus = rouletteData.rouletteStatus;
    }
    catch (error) {
        console.error("Error fetching or parsing data:", error);
        rouletteStatus = false;
    }
}

function sendDashboardUpdate() {
    const intervalTime = 0.5;
    setInterval(async () => {
        await fetchPlayerData();
        await fetchRouletteStatus();

        const data = {
            playerData,
            playerCount,
            sumAmount: getSumAmount(playerData),
            winAmount: getWinAmount(),
            taxAmount: getTaxAmount(),
            rouletteStatus
        };

        // Send to all renderer windows
        BrowserWindow.getAllWindows().forEach(win => {
            win.webContents.send('dashboard-update', data);
        });
    }, intervalTime * 1000);
}

const defaultViewerConfig = {
    nickname: "nxms",
    servername: "nxms.dev",
    timeToDraw: 90,
    taxPercentage: 10,
    language: "pl"
};

function createAppDataShortcut() {
    const appDataDir = path.join(app.getPath("appData"), "RoulettePaymentTracker");
    const shortcut = path.join(app.getPath("documents"), "RoulettePaymentTracker");

    try {
        // If shortcut (symlink) already exists, skip
        if (fileSystem.existsSync(shortcut)) {
            console.log("Shortcut already exists in Documents folder.");
            return;
        }

        // Create symlink to the whole folder
        fileSystem.symlinkSync(appDataDir, shortcut, process.platform === "win32" ? "junction" : "dir");
        console.log("Created shortcut in Documents folder:", shortcut, "→", appDataDir);
    } catch (error) {
        console.error("Failed to create shortcut:", error);
    }
}

async function ensureViewerConfig() {
    try {
        await fileSystem.promises.access(viewerConfigFilePath);
    } catch {
        await fileSystem.promises.writeFile(
            viewerConfigFilePath,
            JSON.stringify(defaultViewerConfig, null, 2),
            "utf-8"
        );
        console.log("Created default viewerConfig.json");
    }
}

async function getViewerConfig() {
    try {
        await ensureViewerConfig();
        const rawData = await fileSystem.promises.readFile(viewerConfigFilePath, "utf-8");
        return JSON.parse(rawData);
    } catch (error) {
        console.error("Error reading viewerConfig.json:", error);
        return defaultViewerConfig;
    }
}
function sendViewerConfigUpdate(config) {
    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send("viewer-config-update", config);
    });
}