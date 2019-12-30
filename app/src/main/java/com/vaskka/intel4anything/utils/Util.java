package com.vaskka.intel4anything.utils;

import java.util.Random;

public class Util {

    public static String getRandomId() {

        Random random = new Random();

        int randomId = Math.abs(random.nextInt()) % Constant.max_valid_node_id + 1;

        return String.valueOf(randomId);
    }


}
