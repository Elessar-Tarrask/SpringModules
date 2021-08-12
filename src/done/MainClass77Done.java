package done;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class MainClass77Done {

    public static void main(String[] args) {
        int n = 20;
        int k = 8;

        System.out.println(combine(n, k));
    }

    public List<List<Integer>> combine1(int n, int k) {
        List<List<Integer>> result = new ArrayList<>();

        for (int i = 1; i < n - k + 1; i++) {

        }

        return result;
    }

//    public static List<Integer> loopFunction(int n, int k) {
//        List<Integer> result = new ArrayList<>();
//        if (k == 1) {
//            return Collections.singletonList(n);
//        }else{
//            for(int i = n -2; i < )
//            loopFunction(n, k-1);
//        }
//        return result;
//    }

    public static List<List<Integer>> combine(int n, int k) {
        List<List<Integer>> list = new ArrayList<>();
        combine(n,k, 1, list, new ArrayList<>());
        return list;
    }

    public static void combine(int n, int k, int i, List<List<Integer>> list, List<Integer>current) {
        if (current.size()==k) list.add(current);
        else if (i<=n && current.size()<k){
            combine(n, k, i+1, list, current);
            combine(n, k, i+1, list, new ArrayList(current){{add(i);}});
        }
    }
}
