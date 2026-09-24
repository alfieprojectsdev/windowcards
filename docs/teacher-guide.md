# WindowCards: Teacher Guide to Advanced Constraints

Welcome to the WindowCards Advanced Constraints guide! 

In **v4.1**, we've introduced a powerful new "Rules Engine" that gives you fine-grained control over exactly what kinds of math problems your students will see. Instead of just basic addition or subtraction, you can now build specific mathematical scenarios tailored to your lesson plan.

## What is the Rules Engine?

Behind the scenes, WindowCards uses a system to "filter" out math problems you don't want. When you select your settings, you are actually building a set of "Rules" (we call them an AST, or Abstract Syntax Tree). 

Every single problem WindowCards generates has to pass your rules before it appears on the worksheet. If it fails, WindowCards throws it away and tries again until it finds a perfect match!

## Available Constraints

Here are the constraints you can mix and match to create the perfect worksheet:

### 1. Addition (+)
* **No carrying:** Ensure students only practice basic column addition without needing to carry over a `1` to the next column. 
  * *Example (Allowed):* `23 + 45`
  * *Example (Blocked):* `28 + 45`

### 2. Subtraction (−)
* **Positive Results Only:** WindowCards automatically ensures the top number (Operand A) is always greater than or equal to the bottom number (Operand B), so students never get negative answers.
* **No borrowing:** Ensure the top digit in every column is larger than the bottom digit, requiring no borrowing.
  * *Example (Allowed):* `87 - 52`
  * *Example (Blocked):* `82 - 57`

### 3. Division (÷)
Division worksheets are built to be clean and straightforward:
* **No Remainders:** All division problems will divide evenly (e.g., `12 ÷ 4 = 3`).
* **Meaningful Practice:** We automatically block "trivial" problems like dividing by 1 (`12 ÷ 1`) or a number divided by itself (`12 ÷ 12`).
* **Digit count:** "Digits per number" sets the size of the number being divided. A 4-digit division sheet has problems like `7,954 ÷ 82`. The divisor has at most half as many digits, rounded up (1-digit divisors for 1- and 2-digit sheets, 2-digit divisors for 3- and 4-digit sheets, 3-digit divisors for 5- and 6-digit sheets).

## How to Use the Constraints

1. Open the WindowCards generator. The settings are in five numbered groups on the left (above the preview on a phone).
2. In **01 Operation**, pick `+`, `−`, `×` or `÷`.
3. In **02 Digits per number**, pick 1 to 6. The "No carrying" option appears only for addition and "No borrowing" only for subtraction.
4. Set **03 Grid size** (up to 10 × 10) and the **04 Printing** number size. If the grid won't fit on one A4 page at that size, a warning suggests a smaller size or fewer columns.
5. The page preview updates as soon as you change a setting. Click **New set** for different problems with the same settings.
6. Click **Print**. With "Print the answer key as page 2" ticked, the answer key prints on its own page after the worksheet.

## Custom Rules

The **05 Custom rules** group lets you add your own rules. Click **Add rule** and change the dropdowns until the rule reads the way you want:

* `Answer` `is less than` `the number…` `100` keeps every answer under 100.
* `First number (A)` `is greater than` `Second number (B)` puts the bigger number on top.
* `Second number (B)` `does not equal` `the number…` `1` removes "times one" problems from a multiplication sheet.

Choose **the number…** to compare with a number you type, or one of the fields to compare with another part of the problem. Every rule must be true for a problem to appear ("and" joins them). A rule with an empty number box is ignored. Remove a rule with its bin button. Your rules are saved in the browser and are still there next time you open the page.

*Note: If your rules can't all be true at once (for example, 1-digit addition with `Answer` `is greater than` `20`), the rules group says "Too strict", shows the range the answers actually fall in, and offers **Remove last rule**. The preview keeps the last worksheet that worked until you fix it.*

## Practice

Click **Practice** in the top bar to let students answer the first 20 problems of the current worksheet on screen. They type an answer and press Enter (or move to the next box) to check it. **Finish and see score** shows how many were right, which ones to look at again, and a button to practise just those. On a phone, problems come one at a time, and a wrong addition or subtraction answer gets a hint such as "Check the ones column — 7 + 8 is more than 10."
