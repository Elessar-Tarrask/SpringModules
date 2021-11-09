package InProcess;

import java.util.HashMap;
import java.util.Map;

public class mainClass3InProcess {


    public static void main(String[] args) {
        mainClass3InProcess a = new mainClass3InProcess();
        String s = "abcabcddbaceb";
        System.out.println("length = " + a.lengthOfLongestSubstring(s));
    }

    public int lengthOfLongestSubstring(String s) {
        int result = 0;
        Map<Character, Integer> characterList = new HashMap<>();
        int currentUniqueLength = 0;
        int currentStringIndex;
        String current = "";
        for (int i = 0; i < s.length(); i++) {
            char a = s.charAt(i);
            if (characterList.containsKey(a)) {
                currentStringIndex = characterList.get(a) + 1;
                if (characterList.get(a) >= currentStringIndex - 1) {
                    int getA = characterList.get(a);
                    currentUniqueLength = i - characterList.get(a);
                }
                current.charAt(characterList.get(s.charAt(i)));
                //current = current.replace(s.charAt(i), ':');
                current = current.substring(s.indexOf(s.charAt(i)), current.length());
                characterList.put(s.charAt(i), i);
                current += s.charAt(i);
            } else {
                characterList.put(s.charAt(i), i);
                current += s.charAt(i);
                currentUniqueLength++;
            }

            if (result < currentUniqueLength) {
                result = currentUniqueLength;
            }
        }
        return result;
    }
}
