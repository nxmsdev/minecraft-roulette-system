package com.roulettepaymenttracker.client;

import com.google.gson.reflect.TypeToken;
import com.google.gson.Gson;
import net.minecraft.sound.SoundEvents;

import java.io.FileWriter;
import java.io.IOException;
import java.io.Reader;

import java.lang.reflect.Type;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.Path;

import java.util.ArrayList;
import java.util.List;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class PaymentDataManager {
    private static final ActionBarNotification actionBarNotification = new ActionBarNotification();
    private static final PlaySoundEffect playSoundEffect = new PlaySoundEffect();

    private static final Gson gson = new Gson(); // creates Gson instance used for JSON serialization and deserialization
    private static final String filePath = System.getenv("APPDATA") + "/RoulettePaymentTracker/paymentData.json"; //file path to JSON file
    private static final Path paymentDataPath = Paths.get(filePath); // converts filePath string to a Path object

    private final ExecutorService executorService = Executors.newFixedThreadPool(2); // thread pool for database operations

    public CompletableFuture<Void> saveData(String paymentUsername, long paymentAmount) {

        return CompletableFuture.runAsync(() -> { // runs the operation on background thread
            PlayerDataHolder newPlayerData = new PlayerDataHolder(paymentUsername, paymentAmount); // hold new player's data
            List<PlayerDataHolder> listOfPlayerData = new ArrayList<>(); // holds all player's data

            try { // created the directory if it's not existing
                if(!Files.exists(paymentDataPath.getParent())) {
                    System.out.println("Creating directories for paymentData.json file.");
                    Files.createDirectories(paymentDataPath.getParent());
                }
            }
            catch (IOException exception) {
                System.out.println("Failed to create directories for paymentData.json file: " + exception.getMessage());
            }

            if (!Files.exists(paymentDataPath)) {
                System.out.println("Couldn't find paymentData.json file.");
                try {
                    System.out.println("Creating an empty paymentData.json file.");
                    String defaultJson = "[]";
                    Files.write(paymentDataPath, defaultJson.getBytes());
                    System.out.println("Created an empty paymentData.json file.");
                }
                catch (IOException exception) {
                    System.out.println("Failed to create empty paymentData.json file: " + exception.getMessage());
                    actionBarNotification.sendMessage("Failed to create paymentData.json.", "§4");
                    playSoundEffect.playSound(SoundEvents.ENTITY_ITEM_BREAK);
                }
            }

            if (Files.exists(paymentDataPath)) {
                try (Reader fileReader = Files.newBufferedReader(paymentDataPath)) { // reads existing data
                    Type listType = new TypeToken<List<PlayerDataHolder>>(){}.getType(); // defines expected type od List<PlayerDataHolder>
                    listOfPlayerData = gson.fromJson(fileReader, listType); // deserialize JSON array into list of PlayerDataHolder objects

                    // if file was null, initialize an empty list to avoid NullPointerException
                    if (listOfPlayerData == null) {
                        listOfPlayerData = new ArrayList<>();
                    }
                }
                catch (IOException exception) {
                    System.out.println("Something went wrong reading existing data: " + exception.getMessage());
                    actionBarNotification.sendMessage("Can't read data from JSON file.", "§4");
                    playSoundEffect.playSound(SoundEvents.ENTITY_ITEM_BREAK);
                }

                boolean playerAlreadyExists = false;
                for (int index = 0; index < listOfPlayerData.size(); index++) {
                    PlayerDataHolder player = listOfPlayerData.get(index);

                    if (player.username().equals(paymentUsername)) {
                        long updatedAmount = player.amount() + paymentAmount; // updates payment amount
                        PlayerDataHolder updatedPlayer = new PlayerDataHolder(paymentUsername, updatedAmount); // creates object with updates payment data

                        listOfPlayerData.set(index, updatedPlayer); // puts updated player data in the place of the old data

                        playerAlreadyExists = true;
                        break; // exits loop
                    }
                }

                if (!playerAlreadyExists) {
                    listOfPlayerData.add(newPlayerData); // adds new player data to list of player data
                }

                // write the updated list back to the JSON file
                try (FileWriter fileWriter = new FileWriter(filePath)) {
                    gson.toJson(listOfPlayerData, fileWriter);

                    System.out.println("Succesfully saved payment data to JSON file");
                    actionBarNotification.sendMessage("Saved payment data to JSON file.", "§a");
                    playSoundEffect.playSound(SoundEvents.ENTITY_VILLAGER_WORK_CARTOGRAPHER);
                } catch (IOException exception) {
                    System.out.println("Something went wrong during saving data to JSON file: " + exception.getMessage());
                    actionBarNotification.sendMessage("Couldn't save payment data to JSON file.", "§4");
                    playSoundEffect.playSound(SoundEvents.ENTITY_ITEM_BREAK);
                }
            }
        }, executorService); // makes the method use dedicated thread pool for execution
    }

    public void async_process_shutdown() {
        executorService.shutdown(); // closes the database connection thread
        System.out.println("Closing Payment Data Manager thread.");
    }
}
