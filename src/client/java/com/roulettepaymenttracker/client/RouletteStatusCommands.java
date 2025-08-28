package com.roulettepaymenttracker.client;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import static net.fabricmc.fabric.api.client.command.v2.ClientCommandManager.literal;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandRegistrationCallback;
import net.minecraft.client.MinecraftClient;
import net.minecraft.sound.SoundEvents;
import net.minecraft.text.Text;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.atomic.AtomicBoolean;

public class RouletteStatusCommands {
    private static final ActionBarNotification actionBarNotification = new ActionBarNotification();
    private static final PlaySoundEffect playSoundEffect = new PlaySoundEffect();
    private final AtomicBoolean rouletteStatus = new AtomicBoolean(false);

    private static final Gson gson = new Gson();
    private static final String filePath = System.getenv("APPDATA") + "/RoulettePaymentTracker/rouletteStatus.json";
    private static final Path statusFilePath = Paths.get(filePath);
    private void saveSatusToJSON() {
        try { // created the directory if it's not existing
            if (!Files.exists(statusFilePath.getParent())) {
                System.out.println("Creating directories for rouletteStatus.json.");
                Files.createDirectories(statusFilePath.getParent());
            }
        } catch (Exception exception) {
            System.out.println("Failed to create directories for rouletteStatus.json: " + exception.getMessage());
        }

        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("rouletteStatus", rouletteStatus.get());
        if (!Files.exists(statusFilePath)) {
            System.out.println("rouletteStatus.json file not found.");
            System.out.println("Creating rouletteStatus.json file.");

            try (FileWriter fileWriter = new FileWriter(filePath)) {
                gson.toJson(jsonObject, fileWriter);
                System.out.println("Succesfully created rouletteStatus.json file.");
            }
            catch (IOException exception) {
                System.out.println("Failed to create rouletteStatus.json file: " + exception.getMessage());
                actionBarNotification.sendMessage("Failed to create rouletteStatus.json.", "§4");
                playSoundEffect.playSound(SoundEvents.ENTITY_ITEM_BREAK);
            }
        }

        if (Files.exists(statusFilePath)) {
            try (FileWriter fileWriter = new FileWriter(filePath)) {
                gson.toJson(jsonObject, fileWriter);
                System.out.println("Saved rouletteStatus.json file.");
                actionBarNotification.sendMessage("Saved roulette status.", "§a");
                playSoundEffect.playSound(SoundEvents.ENTITY_VILLAGER_WORK_CARTOGRAPHER);
            }
            catch (IOException exception) {
                System.out.println("Failed to save rouletteStatus.json file: " + exception.getMessage());
                actionBarNotification.sendMessage("Failed to save roulette status.", "§4");
                playSoundEffect.playSound(SoundEvents.ENTITY_ITEM_BREAK);
            }
        }
    }

    public void register() {
        String alreadyChangedText = "§eRoulette status is already changed to: ";

        ClientCommandRegistrationCallback.EVENT.register((dispatcher, registryAccess) -> {
            dispatcher.register(literal("roulette")
                            .then(literal("status")
                                .then(literal("start")
                                        .executes(context -> {
                                            if (MinecraftClient.getInstance() != null && MinecraftClient.getInstance().player != null) {
                                                if (!rouletteStatus.get()) {
                                                    rouletteStatus.set(true);
                                                    saveSatusToJSON();
                                                    MinecraftClient.getInstance().player.sendMessage(Text.literal("§aRoulette status changed to: true."), false);
                                                }
                                                else {
                                                    MinecraftClient.getInstance().player.sendMessage(Text.literal(alreadyChangedText + rouletteStatus.get()), false);
                                                }
                                            }
                                            return 1;
                                        })
                                )
                                .then(literal("stop")
                                        .executes(context -> {
                                            if (MinecraftClient.getInstance() != null && MinecraftClient.getInstance().player != null) {
                                                if (rouletteStatus.get()) {
                                                    rouletteStatus.set(false);
                                                    saveSatusToJSON();
                                                    MinecraftClient.getInstance().player.sendMessage(Text.literal("§4Roulette status changed to: false."), false);
                                                }
                                                else {
                                                    MinecraftClient.getInstance().player.sendMessage(Text.literal(alreadyChangedText + rouletteStatus.get()), false);
                                                }
                                            }

                                            return 1;
                                        })
                                )
                            )
            );
        });
    }

    public void reset_roulette_status() {
        rouletteStatus.set(false);
        saveSatusToJSON();
    }
}
