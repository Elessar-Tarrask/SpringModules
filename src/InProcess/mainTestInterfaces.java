package InProcess;

import java.util.HashSet;

public class mainTestInterfaces {

    interface A {
        int diff(int x, int y);
    }

    static abstract class E {

    }
    static class B implements A{
        public int diff(int x, int y){return x - y;}
        public int sum(int x, int y){return x + y;}
    }
    static class C extends B{
        public int mult(int x, int y){return x * y;}
        public int diff(int x, int y){return y - x;}
    }

    static class D extends E {

    }

    public static void main(String[] args) {
        A aB = new B();
        A aC = new C();
        B bB = new B();
        B bC = new C();
        C cC = new C();

        System.out.println(aC.diff(1, 2));
        System.out.println(bB.diff(1, 2));

        int a = 15;
        long b = 20_000;
        int d = 20_000;
        short t = 20_000;

        int e = 3 | 1;

//        HashSet t = new HashSet();
//        System.out.println(3 | 1);
    }
}
