from pathlib import Path
import os

try:
    from selenium import webdriver
    from selenium.common.exceptions import TimeoutException, WebDriverException
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.support.ui import WebDriverWait
except ModuleNotFoundError:
    print("Selenium is not installed.")
    print("Run this command first: pip install -r requirements.txt")
    raise SystemExit(1)


LOGIN_URL = "https://practicetestautomation.com/practice-test-login/"
VALID_USERNAME = "student"
VALID_PASSWORD = "Password123"
INVALID_PASSWORD = "wrongPassword"

BASE_DIR = Path(__file__).resolve().parent
SCREENSHOT_DIR = BASE_DIR / "screenshots"
SELENIUM_CACHE_DIR = BASE_DIR / ".selenium_cache"
SCREENSHOT_DIR.mkdir(exist_ok=True)
SELENIUM_CACHE_DIR.mkdir(exist_ok=True)
os.environ.setdefault("SE_CACHE_PATH", str(SELENIUM_CACHE_DIR))


def create_driver():
    """Create a Chrome browser instance for Selenium."""
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-notifications")

    if os.getenv("HEADLESS", "").lower() in ("1", "true", "yes"):
        options.add_argument("--headless=new")
        options.add_argument("--window-size=1366,768")

    return webdriver.Chrome(options=options)


def open_login_page(driver, wait):
    driver.get(LOGIN_URL)
    wait.until(EC.visibility_of_element_located((By.ID, "username")))


def enter_login_details(driver, username, password):
    username_field = driver.find_element(By.ID, "username")
    password_field = driver.find_element(By.ID, "password")

    username_field.clear()
    username_field.send_keys(username)

    password_field.clear()
    password_field.send_keys(password)

    driver.find_element(By.ID, "submit").click()


def test_valid_login(driver, wait):
    open_login_page(driver, wait)
    enter_login_details(driver, VALID_USERNAME, VALID_PASSWORD)

    wait.until(EC.url_contains("logged-in-successfully"))
    wait.until(
        EC.text_to_be_present_in_element(
            (By.TAG_NAME, "body"),
            "successfully logged in",
        )
    )

    driver.save_screenshot(str(SCREENSHOT_DIR / "valid_login_success.png"))
    print("Valid Login: Test Passed")
    return True


def test_invalid_password(driver, wait):
    open_login_page(driver, wait)
    enter_login_details(driver, VALID_USERNAME, INVALID_PASSWORD)

    error_message = wait.until(EC.visibility_of_element_located((By.ID, "error")))
    driver.save_screenshot(str(SCREENSHOT_DIR / "invalid_password_error.png"))

    if error_message.text.strip() == "Your password is invalid!":
        print("Invalid Password: Test Passed")
        return True

    print("Invalid Password: Test Failed")
    print("Expected: Your password is invalid!")
    print(f"Actual: {error_message.text.strip()}")
    return False


def run_test(test_name, test_function, driver, wait):
    try:
        return test_function(driver, wait)
    except TimeoutException as error:
        driver.save_screenshot(str(SCREENSHOT_DIR / f"{test_name}_failed.png"))
        print(f"{test_name}: Test Failed")
        print(f"Reason: Element or message was not found in time. {error}")
        return False
    except WebDriverException as error:
        print(f"{test_name}: Test Failed")
        print(f"Reason: Browser or Selenium error. {error}")
        return False


def main():
    try:
        driver = create_driver()
    except WebDriverException as error:
        print("Browser Setup: Test Failed")
        print("Reason: Chrome or ChromeDriver could not be started.")
        print("Install Google Chrome and allow Selenium Manager to download the matching driver.")
        print(f"Details: {error}")
        return

    wait = WebDriverWait(driver, 10)

    try:
        results = [
            run_test("valid_login", test_valid_login, driver, wait),
            run_test("invalid_password", test_invalid_password, driver, wait),
        ]

        passed_count = results.count(True)
        total_count = len(results)
        print(f"\nTotal Tests Passed: {passed_count}/{total_count}")
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
