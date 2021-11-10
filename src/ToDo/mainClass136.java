package ToDo;

// Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.
//You must implement a solution with a linear runtime complexity and use only constant extra space.

// Example 1:
//Input: nums = [2,2,1]
//Output: 1

//Example 2:
//Input: nums = [4,1,2,1,2]
//Output: 4

//Example 3:
//Input: nums = [1]
//Output: 1

//Constraints:

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

//1 <= nums.length <= 3 * 104
//-3 * 104 <= nums[i] <= 3 * 104
//Each element in the array appears twice except for one element which appears only once.
public class mainClass136 {
    public int singleNumber(int[] nums) {
        Set<Integer> result = new HashSet<>();

        for (int i = 0; i < nums.length; i++) {
            if (result.contains(nums[i]))
                result.remove(nums[i]);
            else
                result.add(nums[i]);
        }

        return new ArrayList<Integer>(result).get(0);
    }

    public static void main(String[] args) {
        mainClass136 mainClass136 = new mainClass136();

        mainClass136.singleNumber(null);
    }
}
