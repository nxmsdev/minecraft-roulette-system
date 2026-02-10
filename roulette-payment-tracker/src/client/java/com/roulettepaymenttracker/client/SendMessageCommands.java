package com.roulettepaymenttracker.client;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.mojang.brigadier.arguments.IntegerArgumentType;
import com.mojang.brigadier.arguments.StringArgumentType;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandRegistrationCallback;
import net.minecraft.client.MinecraftClient;
import net.minecraft.text.Text;
import net.minecraft.sound.SoundEvents;

import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static net.fabricmc.fabric.api.client.command.v2.ClientCommandManager.argument;
import static net.fabricmc.fabric.api.client.command.v2.ClientCommandManager.literal;

public class SendMessageCommands {

    private static final ActionBarNotification actionBarNotification = new ActionBarNotification();
    private static final PlaySoundEffect playSoundEffect = new PlaySoundEffect();
    private static final Gson gson = new Gson();

    private static final String filePath = System.getenv("APPDATA") + "/RoulettePaymentTracker/sendMessageConfig.json";
    private static final Path configPath = Paths.get(filePath);

    public void saveConfig() {
        try {
            if (!Files.exists(configPath.getParent())) {
                Files.createDirectories(configPath.getParent());
            }

            JsonObject json = new JsonObject();
            json.addProperty("messageFirst", SendMessageAfterDraw.getMessageFirst());
            json.addProperty("messageSecond", SendMessageAfterDraw.getMessageSecond());
            json.addProperty("delayTicks", SendMessageAfterDraw.getDelayTicks());

            try (BufferedWriter writer = Files.newBufferedWriter(configPath, StandardCharsets.UTF_8)) {
                gson.toJson(json, writer);
            }

            actionBarNotification.sendMessage("§aSendMessageAfterDraw config saved.", "§a");
            playSoundEffect.playSound(SoundEvents.ENTITY_VILLAGER_WORK_CARTOGRAPHER);

        } catch (IOException e) {
            actionBarNotification.sendMessage("§4Failed to save SendMessageAfterDraw config.", "§4");
            playSoundEffect.playSound(SoundEvents.ENTITY_ITEM_BREAK);
            System.out.println("Failed to save sendMessageConfig.json: " + e.getMessage());
        }
    }

    public void loadConfig() {
        try {
            if (!Files.exists(configPath)) return;

            String jsonString = Files.readString(configPath);
            JsonObject json = gson.fromJson(jsonString, JsonObject.class);

            if (json.has("messageFirst"))
                SendMessageAfterDraw.setMessageFirst(json.get("messageFirst").getAsString());

            if (json.has("messageSecond"))
                SendMessageAfterDraw.setMessageSecond(json.get("messageSecond").getAsString());

            if (json.has("delayTicks"))
                SendMessageAfterDraw.setDelayTicks(json.get("delayTicks").getAsInt());

        } catch (IOException exception) {
            actionBarNotification.sendMessage("§4Failed to load SendMessageAfterDraw config.", "§4");
            playSoundEffect.playSound(SoundEvents.ENTITY_ITEM_BREAK);
            System.out.println("Failed to load sendMessageConfig.json: " + exception.getMessage());
        }
    }

    public void register() {
        ClientCommandRegistrationCallback.EVENT.register((dispatcher, registryAccess) -> {
            dispatcher.register(
                    literal("roulette")
                            .then(literal("sendmessage")
                                    // Reload config
                                    .then(literal("reload")
                                            .executes(context -> {
                                                loadConfig();
                                                MinecraftClient client = MinecraftClient.getInstance();
                                                if (client.player != null) {
                                                    client.player.sendMessage(Text.literal("§aSendMessageAfterDraw config reloaded."), false);
                                                }
                                                return 1;
                                            })
                                    )
                                    // Show info
                                    .then(literal("info")
                                            .executes(context -> {
                                                MinecraftClient client = MinecraftClient.getInstance();
                                                if (client.player != null) {
                                                    client.player.sendMessage(Text.literal("§6[---- Send Message After Draw Config ----]"), false);
                                                    client.player.sendMessage(Text.literal("First Message: §a" + SendMessageAfterDraw.getMessageFirst()), false);
                                                    client.player.sendMessage(Text.literal("Second Message: §a" + SendMessageAfterDraw.getMessageSecond()), false);
                                                    client.player.sendMessage(Text.literal("Delay Ticks: §a" + SendMessageAfterDraw.getDelayTicks()), false);
                                                }
                                                return 1;
                                            })
                                    )
                                    // Set subcommands
                                    .then(literal("set")
                                            .then(literal("firstmessage")
                                                    .then(argument("message", StringArgumentType.greedyString())
                                                            .executes(context -> {
                                                                String value = StringArgumentType.getString(context, "message");
                                                                SendMessageAfterDraw.setMessageFirst(value);
                                                                saveConfig();
                                                                MinecraftClient client = MinecraftClient.getInstance();
                                                                if (client.player != null) {
                                                                    client.player.sendMessage(Text.literal("§aFirst message set to: " + value), false);
                                                                }
                                                                return 1;
                                                            })
                                                    )
                                            )
                                            .then(literal("secondmessage")
                                                    .then(argument("message", StringArgumentType.greedyString())
                                                            .executes(context -> {
                                                                String value = StringArgumentType.getString(context, "message");
                                                                SendMessageAfterDraw.setMessageSecond(value);
                                                                saveConfig();
                                                                MinecraftClient client = MinecraftClient.getInstance();
                                                                if (client.player != null) {
                                                                    client.player.sendMessage(Text.literal("§aSecond message set to: " + value), false);
                                                                }
                                                                return 1;
                                                            })
                                                    )
                                            )
                                            .then(literal("delayticks")
                                                    .then(argument("ticks", IntegerArgumentType.integer(1))
                                                            .executes(context -> {
                                                                int ticks = IntegerArgumentType.getInteger(context, "ticks");
                                                                SendMessageAfterDraw.setDelayTicks(ticks);
                                                                saveConfig();
                                                                MinecraftClient client = MinecraftClient.getInstance();
                                                                if (client.player != null) {
                                                                    client.player.sendMessage(Text.literal("§aDelay ticks set to: " + ticks), false);
                                                                }
                                                                return 1;
                                                            })
                                                    )
                                            )
                                    )
                                    // Test command
                                    .then(literal("test")
                                            .executes(context -> {
                                                MinecraftClient client = MinecraftClient.getInstance();
                                                if (client.player != null) {
                                                    client.player.sendMessage(Text.literal("§eTesting sending messages after a draw."), false);
                                                    client.player.sendMessage(Text.literal("§eTest message is visible for other players."), false);
                                                    client.player.sendMessage(Text.literal("§eMessage will be sent after " + SendMessageAfterDraw.getDelayTicks() + " ticks."), false);
                                                }
                                                SendMessageAfterDraw.start();

                                                return 1;
                                            })
                                    )
                            )
            );
        });
    }
}
