package com.roulettepaymenttracker.client;

import net.fabricmc.api.EnvType;
import net.fabricmc.api.Environment;
import net.minecraft.client.MinecraftClient;
import net.minecraft.client.gui.screen.ingame.HandledScreen;
import net.minecraft.client.network.ClientPlayerEntity;
import net.minecraft.item.ItemStack;
import net.minecraft.item.Items;
import net.minecraft.screen.ScreenHandler;
import net.minecraft.screen.slot.Slot;
import net.minecraft.screen.slot.SlotActionType;

@Environment(EnvType.CLIENT)
public class PaymentConfirmation {

    private static final MinecraftClient minecraftClient = MinecraftClient.getInstance();

    public static void confirm() {
        new Thread(() -> {
            long endTime = System.currentTimeMillis() + 5000;
            while (System.currentTimeMillis() < endTime) {
                minecraftClient.execute(() -> {
                    if (tryConfirmOnce()) {
                        Thread.currentThread().interrupt();
                    }
                });

                try {
                    Thread.sleep(500);
                } catch (InterruptedException exception) {
                    System.out.println("Something went wrong during payment confirmation: " + exception.getMessage());
                }
            }
        }).start();
    }

    private static boolean tryConfirmOnce() {
        if (!(minecraftClient.currentScreen instanceof HandledScreen<?> screen)) {
            System.out.println("Current screen is not HandledScreen: " + minecraftClient.currentScreen);
            return false;
        }

        ScreenHandler handler = screen.getScreenHandler();
        System.out.println("Found screen with " + handler.slots.size() + " slots");

        ClientPlayerEntity player = minecraftClient.player;
        if (player == null || minecraftClient.interactionManager == null) {
            System.out.println("Player or interaction manager is null");
            return false;
        }

        for (int i = 0; i < handler.slots.size(); i++) {
            Slot slot = handler.getSlot(i);
            ItemStack stack = slot.getStack();
            if (!stack.isEmpty()) {
                System.out.println("Slot " + i + ": " + stack.getItem());
            }
            if (!stack.isEmpty() && stack.getItem() == Items.LIME_STAINED_GLASS_PANE) {
                System.out.println("Clicking slot " + i);
                minecraftClient.interactionManager.clickSlot(
                        handler.syncId,
                        i,
                        0,
                        SlotActionType.PICKUP,
                        player
                );
                return true;
            }
        }
        return false;
    }
}
