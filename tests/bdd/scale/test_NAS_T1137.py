# coding=utf-8
"""SCALE UI: feature tests."""

import xpaths
from function import (
    wait_on_element,
    is_element_present,
    attribute_value_exist,
    wait_on_element_disappear,
    run_cmd,
    post
)
from pytest_bdd import (
    given,
    scenario,
    then,
    when,
    parsers,
)
from pytest_dependency import depends


@scenario('features/NAS-T1137.feature', 'Create smb share for ericbsd verify only ericbsd can access it')
def test_create_smb_share_for_ericbsd_verify_only_ericbsd_can_access_it():
    """Create smb share for ericbsd verify only ericbsd can access it."""


@given('the browser is open, the TrueNAS URL and logged in')
def the_browser_is_open_the_truenas_url_and_logged_in(driver, nas_ip, root_password, request):
    """the browser is open, the TrueNAS URL and logged in."""
    depends(request, ['ericbsd_dataset'], scope='session')
    if nas_ip not in driver.current_url:
        driver.get(f"http://{nas_ip}")
        assert wait_on_element(driver, 10, xpaths.login.user_input)
    if not is_element_present(driver, xpaths.sideMenu.dashboard):
        assert wait_on_element(driver, 10, xpaths.login.user_input)
        driver.find_element_by_xpath(xpaths.login.user_input).clear()
        driver.find_element_by_xpath(xpaths.login.user_input).send_keys('root')
        driver.find_element_by_xpath(xpaths.login.password_input).clear()
        driver.find_element_by_xpath(xpaths.login.password_input).send_keys(root_password)
        assert wait_on_element(driver, 5, xpaths.login.signin_button)
        driver.find_element_by_xpath(xpaths.login.signin_button).click()
    else:
        assert wait_on_element(driver, 10, xpaths.sideMenu.dashboard, 'clickable')
        driver.find_element_by_xpath(xpaths.sideMenu.dashboard).click()


@when('you should be on the dashboard, click on Shares on the side menu')
def you_should_be_on_the_dashboard_click_on_shares_on_the_side_menu(driver):
    """you should be on the dashboard, click on Shares on the side menu."""
    assert wait_on_element(driver, 10, xpaths.dashboard.title)
    assert wait_on_element(driver, 10, xpaths.dashboard.systemInfoCardTitle)
    assert wait_on_element(driver, 10, xpaths.sideMenu.shares, 'clickable')
    driver.find_element_by_xpath(xpaths.sideMenu.shares).click()


@then('on the Shares page click on the SMB Add button')
def on_the_shares_page_click_on_the_smb_add_button(driver):
    """on the Shares page click on the SMB Add button."""
    assert wait_on_element(driver, 5, xpaths.sharing.title)
    assert wait_on_element(driver, 7, xpaths.sharing.smbAddButton, 'clickable')
    driver.find_element_by_xpath(xpaths.sharing.smbAddButton).click()


@then(parsers.parse('on the SMB Add set Path to "{path}"'))
def on_the_smb_add_set_path_to_mnttankwheel_dataset(driver, path):
    """on the SMB Add set Path to "/mnt/tank/wheel_dataset"."""
    global dataset_path
    dataset_path = path
    assert wait_on_element(driver, 5, xpaths.smb.addTitle)
    assert wait_on_element(driver, 5, xpaths.smb.path_input, 'inputable')
    driver.find_element_by_xpath(xpaths.smb.path_input).clear()
    driver.find_element_by_xpath(xpaths.smb.path_input).send_keys(path)


@then(parsers.parse('input "{share_name}" as name, click to enable'))
def input_eric_share_as_name_click_to_enable(driver, share_name):
    """input "eric_share" as name, Click to enable."""
    assert wait_on_element(driver, 5, xpaths.smb.name_input, 'inputable')
    driver.find_element_by_xpath(xpaths.smb.name_input).click()
    driver.find_element_by_xpath(xpaths.smb.name_input).clear()
    driver.find_element_by_xpath(xpaths.smb.name_input).send_keys(share_name)
    assert wait_on_element(driver, 5, xpaths.checkbox.enabled, 'clickable')
    checkbox_checked = attribute_value_exist(driver, xpaths.checkbox.enabled, 'class', 'mat-checkbox-checked')
    if not checkbox_checked:
        driver.find_element_by_xpath(xpaths.checkbox.enabled).click()
    assert attribute_value_exist(driver, xpaths.checkbox.enabled, 'class', 'mat-checkbox-checked')


@then(parsers.parse('input "{description}" as description, and click save'))
def input_test_eric_smb_share_as_description_and_click_save(driver, description):
    """input "test eric SMB share" as description, and click save."""
    assert wait_on_element(driver, 5, xpaths.smb.description_input, 'inputable')
    driver.find_element_by_xpath(xpaths.smb.description_input).clear()
    driver.find_element_by_xpath(xpaths.smb.description_input).send_keys(description)
    assert wait_on_element(driver, 5, xpaths.button.save, 'clickable')
    driver.find_element_by_xpath(xpaths.button.save).click()


@then('if Restart SMB Service box appears, click Restart Service')
def if_restart_smb_service_box_appears_click_restart_service(driver):
    """if Restart SMB Service box appears, click Restart Service."""
    assert wait_on_element(driver, 7, xpaths.popup.smbRestart_title)
    assert wait_on_element(driver, 5, xpaths.popup.smbRestart_button, 'clickable')
    driver.find_element_by_xpath(xpaths.popup.smbRestart_button).click()
    assert wait_on_element_disappear(driver, 30, xpaths.progress.progressbar)


@then(parsers.parse('the "{share_name}" should be added to the Shares list'))
def the_eric_share_should_be_added_to_the_shares_list(driver, share_name):
    """the eric_share should be added to the Shares list."""
    assert wait_on_element(driver, 5, xpaths.sharing.smbShareName(share_name))
    assert wait_on_element(driver, 5, xpaths.sharing.smbServiceStatus)


@then(parsers.parse('send a file to the "{share_name}" and "{user}"%"{password}" should succeed'))
def send_a_file_to_the_eric_share(driver, nas_ip, share_name, user, password):
    """send a file to the "eric_share" and "{user}"%"{password}"."""
    run_cmd('touch testfile.txt')
    results = run_cmd(f'smbclient //{nas_ip}/{share_name} -U {user}%{password} -c "put testfile.txt testfile.txt"')
    assert results['result'], results['output']
    run_cmd('rm testfile.txt')


@then('verify that the file is in the dataset')
def verify_that_the_file_is_in_the_dataset(root_password, nas_ip):
    """verify that the file is in the dataset."""
    file = f'{dataset_path}/testfile.txt'
    results = post(nas_ip, '/filesystem/stat/', ('root', root_password), file)
    assert results.status_code == 200, results.text


@then(parsers.parse('send a file to "{share_name}" with "{user}"%"{password}" should fail'))
def send_a_file_to_eric_share_with_foo_should_fail(driver, nas_ip, share_name, user, password):
    """send a file to "eric_share" with "{user}"%"{password}" should fail."""
    run_cmd('touch testfile2.txt')
    results = run_cmd(f'smbclient //{nas_ip}/{share_name} -U {user}%{password} -c "put testfile2.txt testfile2.txt"')
    run_cmd('rm testfile2.txt')
    assert not results['result'], results['output']


@then('verify that the file is not is in the dataset')
def verify_that_the_file_is_not_is_in_the_dataset(root_password, nas_ip):
    """verify that the file is not is in the dataset."""
    file = f'{dataset_path}/testfile2.txt'
    results = post(nas_ip, '/filesystem/stat/', ('root', root_password), file)
    assert results.status_code == 422, results.text
    assert results.json()['message'] == f'Path {dataset_path}/testfile2.txt not found', results.text
