package com.roulettepaymenttracker.client;

import net.fabricmc.fabric.api.client.command.v2.ClientCommandManager;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandRegistrationCallback;
import net.minecraft.client.MinecraftClient;
import net.minecraft.text.Text;

public class OtherCommands {
    public void register() {
        ClientCommandRegistrationCallback.EVENT.register((dispatcher, registryAccess) -> {
            dispatcher.register(
                    ClientCommandManager.literal("roulette")
                            .then(ClientCommandManager.literal("help")
                                    .executes(context -> {
                                        MinecraftClient client = MinecraftClient.getInstance();
                                        if (client != null && client.player != null) {
                                            client.player.sendMessage(Text.literal("§6[---- Roulette Help ----]"), false);
                                            client.player.sendMessage(Text.literal(""), false);

                                            // RouletteStatus commands
                                            client.player.sendMessage(Text.literal("§a/roulette status <start/stop>"), false);
                                            client.player.sendMessage(Text.literal("§7SChanges roulette status value to true or false."), false);
                                            client.player.sendMessage(Text.literal(""), false);

                                            // PaymentCollector commands
                                            client.player.sendMessage(Text.literal("§a/roulette collectorconfig info"), false);
                                            client.player.sendMessage(Text.literal("§7Shows the current payment collector configuration."), false);
                                            client.player.sendMessage(Text.literal(""), false);

                                            client.player.sendMessage(Text.literal("§a/roulette collectorconfig set specifiedcomponentword <word>"), false);
                                            client.player.sendMessage(Text.literal("§7Sets the keyword that will be detected in payment messages."), false);
                                            client.player.sendMessage(Text.literal(""), false);

                                            client.player.sendMessage(Text.literal("§a/roulette collectorconfig set positionofspecifiedword <number>"), false);
                                            client.player.sendMessage(Text.literal("§7Sets the position of the keyword in the message, used to identify payment messages."), false);
                                            client.player.sendMessage(Text.literal(""), false);

                                            client.player.sendMessage(Text.literal("§a/roulette collectorconfig set positionofamount <number>"), false);
                                            client.player.sendMessage(Text.literal("§7Sets the position of the payment amount in the message."), false);
                                            client.player.sendMessage(Text.literal(""), false);

                                            client.player.sendMessage(Text.literal("§a/roulette collectorconfig set positionofusername <number>"), false);
                                            client.player.sendMessage(Text.literal("§7Sets the position of the username in the message."), false);
                                            client.player.sendMessage(Text.literal(""), false);

                                            client.player.sendMessage(Text.literal("§a/roulette collectorconfig set messagecomponentsize <number>"), false);
                                            client.player.sendMessage(Text.literal("§7Sets the number of words in the payment message."), false);
                                            client.player.sendMessage(Text.literal(""), false);

                                            // SendMessageAfterDraw commands
                                            client.player.sendMessage(Text.literal("§a/roulette sendmessage reload"), false);
                                            client.player.sendMessage(Text.literal("§7Reloads the SendMessageAfterDraw configuration from JSON."), false);
                                            client.player.sendMessage(Text.literal(""), false);

                                            client.player.sendMessage(Text.literal("§a/roulette sendmessage info"), false);
                                            client.player.sendMessage(Text.literal("§7Shows the current SendMessageAfterDraw configuration."), false);
                                            client.player.sendMessage(Text.literal(""), false);

                                            client.player.sendMessage(Text.literal("§a/roulette sendmessage test"), false);
                                            client.player.sendMessage(Text.literal("§7Sends message that is used after a winner is drawn. To check both messages use it twice."), false);
                                            client.player.sendMessage(Text.literal(""), false);


                                            client.player.sendMessage(Text.literal("§a/roulette sendmessage set firstmessage <text>"), false);
                                            client.player.sendMessage(Text.literal("§7Sets the first message that will be sent after a draw."), false);
                                            client.player.sendMessage(Text.literal(""), false);

                                            client.player.sendMessage(Text.literal("§a/roulette sendmessage set secondmessage <text>"), false);
                                            client.player.sendMessage(Text.literal("§7Sets the second message that will be sent after a draw."), false);
                                            client.player.sendMessage(Text.literal(""), false);

                                            client.player.sendMessage(Text.literal("§a/roulette sendmessage set delayticks <number>"), false);
                                            client.player.sendMessage(Text.literal("§7Sets the delay in ticks before sending the next message."), false);
                                            client.player.sendMessage(Text.literal(""), false);
                                        }
                                        return 1;
                                    })
                            )
            );
        });
    }
}
