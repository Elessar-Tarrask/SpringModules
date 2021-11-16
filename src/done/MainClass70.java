package done;

public class MainClass70 {

    public static void main(String[] args) {
        MainClass70 mainClass70 = new MainClass70();
        mainClass70.climbStairs(10);
    }


    // используем fibonnacci
    public int climbStairs(int n) {
        int[] intArray = new int[n + 1];
        intArray[0] = 0;
        intArray[1] = 1;
        intArray[2] = 2;

        for (int i = 3; i < n; i++) {
            intArray[i] = intArray[i - 2] + intArray[i - 1];
        }

        return intArray[n];
    }
}
