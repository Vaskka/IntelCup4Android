package com.vaskka.intel4anything.utils;

import java.util.Random;

public class Util {

    public static String getRandomId() {

        Random random = new Random();

        return String.valueOf((random.nextInt() % 30) + 1);
    }


}
