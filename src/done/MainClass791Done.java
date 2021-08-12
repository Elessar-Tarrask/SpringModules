package done;

import java.util.LinkedHashMap;
import java.util.Map;

public class MainClass791Done {
    public static void main(String[] args) {
        String order = "cbatyuio";
        String str = "abcd";

        System.out.println(customSortString(order, str));
    }

    public static String customSortString(String order, String str) {
        Map<Character, String> states = new LinkedHashMap<>();
        StringBuilder result = new StringBuilder();
        for (char eachChar : order.toCharArray()) {
            states.put(eachChar, "");
        }

        for (char eachChar : str.toCharArray()) {
            states.put(eachChar, states.getOrDefault(eachChar, "") + eachChar);
        }

        for (char a : states.keySet()) {
            result.append(states.get(a));
        }
        return result.toString();
    }
}
