# Website handoff: India HAP archive, batch 2

Use India_HAP_Combined_Verified.csv or India_HAP_Combined_Verified.json as the catalogue: 146 verified documents in total.
India_HAP_Batch_2_Verified.csv contains only the 33 additions. Do not append it again after importing the combined file.
India_HAP_Batch_2_Unverified_Leads.csv contains 67 unresolved leads. Keep them separate from public verified results.
India_HAP_Batch_2_100_Screened_Records.csv is the research log subset, not a 100-document verified download list.

Use the original record IDs. The JSON adds document_type from the CSV notes prefix and verification_checked.
Read the coverage report and audit before changing category counts or verification wording. Retain unknown years and caveats.
The combined count is 85 standalone HAPs + 37 embedded heat-health plans + 1 national plan + 23 guidance documents.
Do not label all 146 records as standalone HAPs. Do not label source verification as official adoption or fresh download success.

Downloader: python -m pip install requests
python download_heat_action_plans.py India_HAP_Combined_Verified.csv

PDF source documents are not bundled. New records were verified through research retrieval, not a local bulk byte download.
