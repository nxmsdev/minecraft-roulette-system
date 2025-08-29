package com.roulettepaymenttracker.client;

import com.google.gson.Gson;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.minecraft.client.MinecraftClient;
import net.minecraft.sound.SoundEvents;

import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public final class SendMessageAfterDraw {

    private static final ActionBarNotification actionBarNotification = new ActionBarNotification();
    private static final PlaySoundEffect playSoundEffect = new PlaySoundEffect();

    private static int ticksRemaining = -1;

    private static String messageFirst = "First Message";
    private static String messageSecond = "Second Message";
    private static int delayTicks = 100;

    private static boolean sendFirstMessage = true;

    private static final String configPathString = System.getenv("APPDATA") + "/RoulettePaymentTracker/sendMessageConfig.json";
    private static final Path configPath = Paths.get(configPathString);

    public static String getMessageFirst() { return messageFirst; }
    public static void setMessageFirst(String message) { messageFirst = message; }

    public static String getMessageSecond() { return messageSecond; }
    public static void setMessageSecond(String message) { messageSecond = message; }

    public static int getDelayTicks() { return delayTicks; }
    public static void setDelayTicks(int ticks) { delayTicks = ticks; }

    static class ConfigData {
        String messageFirst = "first_message";
        String messageSecond = "second_message";
        int delayTicks = 100;
    }

    private SendMessageAfterDraw() {}

    public static void loadConfig() {
        try {
            if (!Files.exists(configPath.getParent())) {
                System.out.println("Creating directories for sendMessageConfig.json file.");
                Files.createDirectories(configPath.getParent());
            }
        }
        catch (IOException exception) {
            System.out.println("Failed to create directories for sendMessageConfig.json file: " + exception.getMessage());
        }

        Gson gson = new Gson();

        try {
            if (!Files.exists(configPath) || (Files.size(configPath) == 0)) {
                System.out.println("Couldn't find sendMessageConfig.json file.");

                ConfigData defaultConfig = new ConfigData();
                try (FileWriter writer = new FileWriter(configPath.toFile())) {
                    gson.toJson(defaultConfig, writer);
                }
                System.out.println("Created default sendMessageConfig.json file.");
                actionBarNotification.sendMessage("Created default sendMessageConfig.json.", "§e");
                playSoundEffect.playSound(SoundEvents.ENTITY_ITEM_BREAK);
            }
        } catch (IOException exception) {
            System.out.println("Failed to create empty sendMessageConfig.json file: " + exception.getMessage());
            actionBarNotification.sendMessage("Failed to create sendMessageConfig.json.", "§4");
            playSoundEffect.playSound(SoundEvents.ENTITY_ITEM_BREAK);
        }

        try (Reader reader = new FileReader(configPath.toFile())) {
            ConfigData config = gson.fromJson(reader, ConfigData.class);
            if (config != null) {
                messageFirst = config.messageFirst;
                messageSecond = config.messageSecond;
                delayTicks = config.delayTicks;
            }
        }
        catch (IOException exception) {
            System.out.println("Filed to read data from sendMessageConfig.json file: " + exception.getMessage());
            actionBarNotification.sendMessage("Failed to read sendMessageConfig.json", "§4");
            playSoundEffect.playSound(SoundEvents.ENTITY_ITEM_BREAK);
        }
    }

    private static void sendMessage(String message) {
        MinecraftClient minecraftClient = MinecraftClient.getInstance();
        if (minecraftClient != null && minecraftClient.player != null) {
            minecraftClient.player.networkHandler.sendChatMessage(message);
        }
    }

    public static void start() {
        if (ticksRemaining <= 0) {
            ticksRemaining = delayTicks;
        }
    }

    public static void register() {
        ClientTickEvents.END_CLIENT_TICK.register(client -> {
            if (ticksRemaining > 0) {
                ticksRemaining--;
                if (ticksRemaining == 0) {
                    if (sendFirstMessage) {
                        sendMessage(messageFirst);
                    } else {
                        sendMessage(messageSecond);
                    }
                    sendFirstMessage = !sendFirstMessage;
                    ticksRemaining = -1;
                }
            }
        });
    }
}
