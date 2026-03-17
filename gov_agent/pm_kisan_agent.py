from playwright.async_api import async_playwright


async def check_pm_kisan_status(aadhaar: str) -> dict:
    """
    Check PM-KISAN beneficiary status by Aadhaar number.
    Scrapes the official PM-KISAN portal using headless Chromium.
    """
    browser = None
    try:
        pw = await async_playwright().start()
        browser = await pw.chromium.launch(headless=True)
        page = await browser.new_page()

        await page.goto(
            "https://pmkisan.gov.in/BeneficiaryStatus/BeneficiaryStatus_ja.aspx",
            wait_until="networkidle",
        )

        # Select "Aadhaar Number" from the dropdown
        await page.select_option(
            "#ctl00_ContentPlaceHolder1_DropDownList1", value="A"
        )

        # Fill the Aadhaar number
        await page.fill(
            "#ctl00_ContentPlaceHolder1_txtDataValue", aadhaar
        )

        # Click Get Data
        await page.click("#ctl00_ContentPlaceHolder1_btnGetData")

        # Wait for results to load
        await page.wait_for_timeout(5000)

        # Check if a result table exists
        result_table = await page.query_selector("table.table")
        if not result_table:
            return {
                "status": "not_found",
                "message": "No beneficiary found",
            }

        # Extract all rows from the result table
        rows = await result_table.query_selector_all("tr")

        beneficiary_name = ""
        father_name = ""
        state = ""
        district = ""
        installments_count = 0
        last_payment_amount = ""
        last_payment_date = ""

        # Parse header-value pairs from the top info rows
        for row in rows:
            cells = await row.query_selector_all("td")
            cell_texts = []
            for cell in cells:
                text = (await cell.inner_text()).strip()
                cell_texts.append(text)

            row_text = " ".join(cell_texts).lower()

            if "beneficiary name" in row_text or "farmer name" in row_text:
                beneficiary_name = cell_texts[-1] if cell_texts else ""
            elif "father" in row_text or "husband" in row_text:
                father_name = cell_texts[-1] if cell_texts else ""
            elif "state" in row_text:
                state = cell_texts[-1] if cell_texts else ""
            elif "district" in row_text:
                district = cell_texts[-1] if cell_texts else ""

        # Extract installment details from the payment table
        payment_tables = await page.query_selector_all("table.table")
        if len(payment_tables) > 1:
            payment_table = payment_tables[-1]
            payment_rows = await payment_table.query_selector_all("tr")
            # Skip header row
            data_rows = payment_rows[1:] if len(payment_rows) > 1 else []
            installments_count = len(data_rows)

            if data_rows:
                last_row_cells = await data_rows[-1].query_selector_all("td")
                last_row_texts = []
                for cell in last_row_cells:
                    text = (await cell.inner_text()).strip()
                    last_row_texts.append(text)

                if len(last_row_texts) >= 2:
                    last_payment_amount = last_row_texts[-2]
                    last_payment_date = last_row_texts[-1]

        return {
            "beneficiary_name": beneficiary_name,
            "father_name": father_name,
            "state": state,
            "district": district,
            "installments_count": installments_count,
            "last_payment_amount": last_payment_amount,
            "last_payment_date": last_payment_date,
            "status": "found",
        }

    except Exception as e:
        raise Exception(f"PM-KISAN status check failed: {str(e)}")

    finally:
        if browser:
            await browser.close()
