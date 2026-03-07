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

## How to Use the Constraints

1. Open the WindowCards generator.
2. Select your desired operation (`+`, `-`, `×`, or `÷`).
3. Notice that the constraint checkboxes (like "Avoid Carrying") will automatically enable or disable depending on the operation you chose!
4. Check the boxes for the rules you want to apply.
5. Click **Generate!**

*Note: If you make your rules too strict (for example, trying to find 100 division problems with 1-digit numbers that have no remainders), the engine might struggle to find enough unique problems. If the worksheet looks incomplete, try relaxing your constraints or using larger numbers!*
