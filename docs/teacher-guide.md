# WindowCards: Teacher Guide to Advanced Constraints

Welcome to the WindowCards Advanced Constraints guide! 

In **v4.1**, we've introduced a powerful new "Rules Engine" that gives you fine-grained control over exactly what kinds of math problems your students will see. Instead of just basic addition or subtraction, you can now build specific mathematical scenarios tailored to your lesson plan.

## What is the Rules Engine?

Behind the scenes, WindowCards uses a system to "filter" out math problems you don't want. When you select your settings, you are actually building a set of "Rules" (we call them an AST, or Abstract Syntax Tree). 

Every single problem WindowCards generates has to pass your rules before it appears on the worksheet. If it fails, WindowCards throws it away and tries again until it finds a perfect match!

## Available Constraints

Here are the constraints you can mix and match to create the perfect worksheet:

### 1. Addition (+)
* **Avoid Carrying:** Ensure students only practice basic column addition without needing to carry over a `1` to the next column. 
  * *Example (Allowed):* `23 + 45`
  * *Example (Blocked):* `28 + 45`

### 2. Subtraction (−)
* **Positive Results Only:** WindowCards automatically ensures the top number (Operand A) is always greater than or equal to the bottom number (Operand B), so students never get negative answers.
* **Avoid Borrowing:** Ensure the top digit in every column is larger than the bottom digit, requiring no borrowing.
  * *Example (Allowed):* `87 - 52`
  * *Example (Blocked):* `82 - 57`

### 3. Division (÷)
Division worksheets are built to be clean and straightforward:
* **No Remainders:** All division problems will divide evenly (e.g., `12 ÷ 4 = 3`).
* **Meaningful Practice:** We automatically block "trivial" problems like dividing by 1 (`12 ÷ 1`) or a number divided by itself (`12 ÷ 12`).
* **Digit count:** "Digits" sets the size of the number being divided. A 4-digit division sheet has problems like `7,954 ÷ 82`. The divisor has at most half as many digits, rounded up (1-digit divisors for 1- and 2-digit sheets, 2-digit divisors for 3- and 4-digit sheets, 3-digit divisors for 5- and 6-digit sheets).

## How to Use the Constraints

1. Open the WindowCards generator.
2. Select your desired operation (`+`, `-`, `×`, or `÷`).
3. Notice that the constraint checkboxes (like "Avoid Carrying") will automatically enable or disable depending on the operation you chose!
4. Check the boxes for the rules you want to apply. The worksheet updates as soon as you change a setting.

## Custom Constraints

The **Custom Constraints** box lets you add your own rules. Click **+ Add Rule** and build a sentence from the dropdowns:

* `Result` `Less Than` `Number` `100` keeps every answer under 100.
* `Operand A` `Greater Than` `Field` `Operand B` puts the bigger number on top.
* `Operand B` `Not Equals` `Number` `1` removes "times one" problems from a multiplication sheet.

Choose **Number** to compare with a number you type, or **Field** to compare with another part of the problem. Every rule must be true for a problem to appear. A rule with an empty number box is ignored. Remove a rule with the red **✕**. Your rules are saved in the browser and are still there next time you open the page.

*Note: If your rules can't all be true at once (for example, 1-digit addition with `Result` `Greater Than` `20`), the app shows a message and keeps the previous worksheet. Relax a rule or use more digits and it will generate again.*
