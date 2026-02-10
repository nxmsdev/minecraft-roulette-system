package com.roulettepaymenttracker.client;

import net.fabricmc.fabric.api.client.message.v1.ClientReceiveMessageEvents;

import net.minecraft.sound.SoundEvents;
import net.minecraft.text.Text;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.function.BiConsumer;

public class PaymentCollector {
    private static final ActionBarNotification actionBarNotification = new ActionBarNotification();
    private static final PlaySoundEffect playSoundEffect = new PlaySoundEffect();
    private static final PaymentCollectorCommands paymentCollectorCommands = new PaymentCollectorCommands();

    public String paymentUsername; // name of the user that sent the payment
    public long paymentAmount; // amount that user sent in payment

    private long parseAmount(String rawAmount) {
        rawAmount = rawAmount.replaceAll("[$]", "");

        if (rawAmount.matches("(?i).*(k)$")) {
            double value = Double.parseDouble(rawAmount.replaceAll("(?i)(k)$", ""));
            return (long) (value * 1000);
        } else if (rawAmount.matches("(?i).*(mln|m)$")) {
            double value = Double.parseDouble(rawAmount.replaceAll("(?i)(mln|m)$", ""));
            return (long) (value * 1_000_000);
        } else if (rawAmount.matches("(?i).*(b)$")) {
            double value = Double.parseDouble(rawAmount.replaceAll("(?i)(b)$", ""));
            return (long) (value * 1_000_000_000);
        } else {
            return (long) Double.parseDouble(rawAmount);
        }
    }

    public void registerListener(BiConsumer<String, Long> onPaymentReceived) {
        ClientReceiveMessageEvents.GAME.register((text, overlay) -> {
            List<Text> paymentComponents = new ArrayList<>();
            collectAllTextComponents(text, paymentComponents); // collects all components

            try {
                String[] componentArray = Arrays.stream(paymentComponents.getFirst().getString().split(" "))
                        .filter(s -> !s.isEmpty())
                        .toArray(String[]::new);

                for (int index = 0; index < componentArray.length; index++) {
                    if (index != paymentCollectorCommands.getPositionOfAmount()) {
                        componentArray[index] = componentArray[index].replaceAll("[!.:]", "");
                    }
                }

                String messageSpecifiedWord = componentArray[paymentCollectorCommands.getPositionOfSpecifiedWord()];
                String messageUsername = componentArray[paymentCollectorCommands.getPositionOfUsername()];
                long messageAmount = parseAmount(componentArray[paymentCollectorCommands.getPositionOfAmount()]);
                int messageSize = componentArray.length;

                for (int index = 0; index < messageSize; index++) {
                    System.out.println("Cwel " + index + ": " + componentArray[index]);
                }

                // checks if the first word specified by player and first word, that have position specified by player, the same
                boolean isFirstWordMatching = messageSpecifiedWord.equals(paymentCollectorCommands.getSpecifiedComponentWord());
                boolean isSizeEqual = messageSize == paymentCollectorCommands.getPaymentMessageComponentSize();

                if(isFirstWordMatching && isSizeEqual) {
                    try {
                        this.paymentAmount = messageAmount;
                        this.paymentUsername = messageUsername;

                        onPaymentReceived.accept(paymentUsername, paymentAmount);  // notify the callback
                    } catch (Exception exception) {
                        System.out.println("Failed to retrieve payment price and username: " + exception.getMessage());
                        actionBarNotification.sendMessage("Failed to retrieve payment price and username", "§4");
                        playSoundEffect.playSound(SoundEvents.ENTITY_ITEM_BREAK);
                    }
                }
            } catch (Exception exception) {
                // System.out.println("Message failed to pass pre-check.");
                // ingore
            }
        });
    }

    // collects all components from payment message and turns them into a List<Text>
    private void collectAllTextComponents(Text root, List<Text> collector) {
        collector.add(root);

        for (Text sibling : root.getSiblings()) {
            collectAllTextComponents(sibling, collector);
        }
    }
}