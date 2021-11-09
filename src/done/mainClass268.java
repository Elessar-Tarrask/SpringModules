package done;

public class mainClass268 {

    public static void main(String[] args) {
        mainClass268 a = new mainClass268();


    }

    public int missingNumber(int[] nums) {
        int sum = nums.length;    // num
        for (int i = 0; i < nums.length; i++)
            sum += i - nums[i];   //
        return sum;
    }
}
