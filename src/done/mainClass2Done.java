package done;

import java.util.List;

public class mainClass2Done {

    public static ListNode createListNodes(ListNode a, int val) {
        a.next = new ListNode(val);
        return a.next;
    }

    public static void main(String[] args) {
        ListNode l1 = new ListNode(9);
        ListNode l2 = new ListNode(9);
        ListNode current = l1;
        for (int i = 0; i < 6; i++) {
            current = createListNodes(current, 9);
        }

        current = l2;
        for (int i = 0; i < 3; i++) {
            current = createListNodes(current, 9);
        }

        var a = addTwoNumbers(l1, l2);
        while (a.next != null) {
            System.out.println(a.val);
            a = a.next;
        }
        System.out.println(a.val);
    }

    public static ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode result = new ListNode();
        int remainder = 0;
        remainder = addNumbers(result, l1.val, l2.val, remainder);
        ListNode current = result;
        if (l1.next != null || l2.next != null) {
            do {
                current.next = new ListNode();
                l1 = (l1.next != null) ? l1.next : new ListNode(0, null);
                l2 = (l2.next != null) ? l2.next : new ListNode(0, null);
                remainder = addNumbers(current.next, l1.val, l2.val, remainder);
                current = current.next;
            } while (l1.next != null || l2.next != null);
        }
        if (remainder == 1) {
            current.next = new ListNode(remainder);
        }
        return result;
    }

    public static int addNumbers(ListNode result, int a, int b, int remainder) {
        result.val = (a + b + remainder) % 10;
        remainder = (a + b + remainder) / 10;
        return remainder;
    }

    public static class ListNode {
        int val;
        ListNode next;

        ListNode() {
        }

        ListNode(int val) {
            this.val = val;
        }

        ListNode(int val, ListNode next) {
            this.val = val;
            this.next = next;
        }
    }
}
