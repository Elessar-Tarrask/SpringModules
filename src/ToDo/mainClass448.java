package ToDo;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class mainClass448 {

    public List<Integer> findDisappearedNumbers(int[] nums) {
        Set<Integer> integerList = new HashSet<>();
        List<Integer> result = new ArrayList<>();
        for (int num : nums) {
            integerList.add(num);
        }

        for (int i = 0; i < nums.length; i++) {
            if (!integerList.contains(i + 1))
                result.add(i + 1);
        }

        return result;
    }

    public List<Integer> findDisappearedNumbers2(int[] nums) {
        List<Integer> result = new ArrayList<>();
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] > 0) {
                if (nums[(nums[i]) - 1] > 0)
                    nums[nums[i] - 1] = -nums[nums[i] - 1];
            } else if (nums[(-nums[i]) - 1] > 0)
                nums[(-nums[i]) - 1] = -nums[(-nums[i]) - 1];
        }

        for (int i = 0; i < nums.length; i++) {
            if (nums[i] > 0) {
                result.add(i + 1);
            }
        }

        return result;
    }

    public static void main(String[] args) {
        mainClass448 a = new mainClass448();

        a.findDisappearedNumbers2(new int[]{4, 3, 2, 7, 8, 2, 3, 1});
    }
}
