# TODO - Car Insurance Claim Workflow Updates

## Step 1: Backend - change detection timing
- [x] Modify `backend/controllers/claimController.js` (remove ML analysis from `submitClaim`, add claim saved without fraud fields, status set to `Under Review`)
- [x] Add `detectClaim` controller that calls ML `/analyze-claim` and updates claim with full report
- [x] Add route `POST /api/claims/:claimId/detect` (admin-triggered)




## Step 2: Backend - routes
- [ ] Update `backend/routes/ClaimRoutes.js` to include the new detect endpoint

## Step 3: Frontend - remove user results page
- [x] Update `src/App.js` to remove routes `/results` and `/result`
- [x] Update `src/pages/Predict.js` (claim submission)
  - [x] Remove `localStorage.predictionResult` storage
  - [x] After successful submit, show only success message + under review text
  - [x] Redirect to `/myclaims` (or `/user-dashboard`)
- [x] Update `src/pages/MyClaims.js`, `src/pages/UserDashboard.js`, `src/pages/ClaimHistory.js`, `src/pages/ClaimStatus.js` to hide prediction/risk fields


## Step 4: Frontend - admin detect report only on Detect
- [ ] Update `src/pages/AdminDashboard.js`
  - [ ] Remove prediction/risk fields from claim details modal (until Detect runs)
  - [ ] Add “Detect” button calling new detect endpoint
  - [ ] Render the full “Claim Detection Report” only after detect response


## Step 5: Cleanup / verify
- [ ] Ensure no user route/pages reference prediction results
- [ ] Run dev servers/tests and validate:
  - [ ] User submission shows only success + redirect
  - [ ] Admin report appears only after Detect click

