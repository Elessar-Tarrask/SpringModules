package done;

import java.util.ArrayList;
import java.util.List;

public class mainClass658Done {

    public static void main(String[] args) {
        findClosestElements(new int[]{1,2,3,4,5},4, 3);
    }

    public static List<Integer> findClosestElements(int[] arr, int k, int x) {
        int left = 0, right = arr.length - k;   // left = 0 right = length

        while (left < right) {
            int mid = (left + right) / 2;
            if (x - arr[mid] > arr[mid + k] - x)
                left = mid + 1;
            else
                right = mid;
        }
        List<Integer> res = new ArrayList<>();
        for (int i = 0; i < k; i++) res.add(arr[left + i]);
        return res;

    }
}
