package done;

public class MainClass121Done {
    public static void main(String[] args) {

    }

    public int maxProfit(int[] prices) {
        int min = prices[0];
        int max = 0;
        int razniva = 0;
        for (int price : prices) {
            if (price < min) {
                min = price;
                max = price;
            }
            if (price > max) {
                max = price;
                if (razniva < (max - min))
                    razniva = max - min;

            }
        }

        return Math.max(razniva, (max - min));
    }

    // идеальным решением будет следить за минимальным значением и максимальной прибылью

    private int bestSolution(int[] a) {
        int minValue = a[0];
        int maxProfit = 0;
        for (int b : a) {
            if (b < minValue)
                minValue = b;
            else if (b - minValue > maxProfit)
                maxProfit = b - minValue;
        }
        return maxProfit;
    }
}
