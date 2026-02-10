package com.roulettepaymenttracker.client;

import net.minecraft.client.MinecraftClient;
import net.minecraft.client.sound.PositionedSoundInstance;
import net.minecraft.client.sound.SoundInstance;
import net.minecraft.sound.SoundEvent;

public class PlaySoundEffect {
    MinecraftClient minecraftClient = MinecraftClient.getInstance();

    public void playSound(SoundEvent soundEvent) {
        if (minecraftClient.player != null) {
            SoundInstance soundInstance = PositionedSoundInstance.master(soundEvent, 1.0f, 0.5f);

            minecraftClient.getSoundManager().play(soundInstance);
        }
    }
}
