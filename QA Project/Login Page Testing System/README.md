# Login Page Testing System

A simple QA testing project for freshers. It demonstrates basic manual testing, Selenium automation testing, screenshot capture, and bug reporting for a demo login page.

## Tools Used

- Python
- Selenium WebDriver
- Chrome browser
- Text files for manual test cases and bug reports

## Project Structure

```text
Login Page Testing System/
├── README.md
├── bugs.txt
├── login_test.py
├── requirements.txt
├── screenshots/
│   └── .gitkeep
└── test_cases.txt
```

## Demo Website

The automation script uses this practice login page:

https://practicetestautomation.com/practice-test-login/

Valid credentials:

- Username: `student`
- Password: `Password123`

## What Is Covered

- Manual test cases for valid login, invalid password, invalid username, empty username, empty password, and both fields empty
- Automated valid login test
- Automated invalid password test
- Screenshot capture for successful login and invalid password scenarios
- Sample bug reports with steps, expected result, and actual result

## How To Run

1. Open a terminal in this project folder.
2. Install Selenium:

```bash
pip install -r requirements.txt
```

3. Run the automation script:

```bash
python login_test.py
```

4. Check the terminal output for:

```text
Test Passed
Test Failed
```

5. Check the `screenshots/` folder for captured screenshots.

## Optional Headless Run

To run Chrome without opening the browser window:

PowerShell:

```powershell
$env:HEADLESS="1"
python login_test.py
```

Command Prompt:

```bash
set HEADLESS=1 && python login_test.py
```

macOS or Linux:

```bash
HEADLESS=1 python login_test.py
```

To turn headless mode off in PowerShell:

```powershell
Remove-Item Env:HEADLESS
python login_test.py
```
