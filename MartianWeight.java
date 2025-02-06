package com.techelevator;

import java.util.Scanner;

/*S
In case you've ever pondered how much you weigh on Mars, here's the calculation:
 	Wm = We * 0.378
 	where 'Wm' is the weight on Mars, and 'We' is the weight on Earth
 
Write a command line program which accepts a series of Earth weights from the user  
and displays each Earth weight as itself, and its Martian equivalent.

Enter a series of Earth weights (space-separated): 98 235 185
 
 98 lbs. on Earth is 37 lbs. on Mars.
 235 lbs. on Earth is 88 lbs. on Mars.
 185 lbs. on Earth is 69 lbs. on Mars. 
 */
public class MartianWeight {

    public static void main(String[] args) {

        final Scanner input = new Scanner(System.in);

        //What is your weight

        System.out.print("Enter a series of Earth weights (space-separated):");

        // get info
        String value = input.nextLine();
        //
        String[] arrayOfEarthWeights = value.split(" ");
        int[] arrayOfEarthWeightsInt = new int[arrayOfEarthWeights.length];
        for (int i = 0; i < arrayOfEarthWeights.length; i++) {

            arrayOfEarthWeightsInt[i] = (Integer.parseInt(arrayOfEarthWeights[i]));

        }
        int[] arrayOfMarsWeights =  arrayOfEarthWeightsInt;
        for (int i = 0; i < arrayOfMarsWeights.length; i++) {
            arrayOfMarsWeights[i] = (int) (arrayOfMarsWeights[i] * 0.378);

        }
        for (int i = 0; i < arrayOfEarthWeights.length; i++) {
            System.out.print(arrayOfEarthWeights[i]);
            System.out.print(" lbs. on Earth is ");
            System.out.print(arrayOfMarsWeights[i]);
            System.out.println(" lbs.on Mars.");
        }



    }

}
