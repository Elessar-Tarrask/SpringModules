package done;

import java.util.HashSet;
import java.util.Set;

public class mainClass217 {

    public static void main(String[] args) {
        mainClass217 a = new mainClass217();
        a.containsDuplicate(new int[4]);
    }

    public boolean containsDuplicate(int[] nums) {
        Set<Integer> a = new HashSet();
        for (int i = 0; i < nums.length; i++) {
            a.add(nums[i]);
            if (a.size() != (i + 1)) return true;
        }
        return false;
    }
}
