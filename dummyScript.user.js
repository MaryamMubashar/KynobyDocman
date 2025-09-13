// ==UserScript==
// @name         Docman Extractor
// @description  Extracts documents from Docman
// @grant        GM_registerMenuCommand
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM.getValue
// @grant        GM_setValue
// @grant        GM.setValue
// @require      https://cdn.jsdelivr.net/gh/jquery/jquery/dist/jquery.min.js
// @require      https://jpillora.com/xhook/dist/xhook.min.js
// @require      https://openuserjs.org/src/libs/sizzle/GM_config.js
// @match        https://*.docman.thirdparty.nhs.uk/DocumentViewer/Filing*
// @match        https://*.docman.thirdparty.nhs.uk/Filing/BeginFilingFromBatch
// @match        https://*.docman.thirdparty.nhs.uk/TasksViewer/Tasks
// @match        https://*.docman.thirdparty.nhs.uk/TasksViewer/ShowProcessTask*
// @match        https://*.docman.thirdparty.nhs.uk/Filing/ConfirmFilingSectionItem*
// @namespace    KYNOBY
// @version      2.0.7.1
// @author       Zaeem
// @updateURL    http://100.81.239.73:3000/script-update
// @downloadURL  http://100.81.239.73:3000/script-update
// ==/UserScript==

(()=>{"use strict";var __webpack_modules__={834:(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{
/* harmony export */__webpack_require__.d(__webpack_exports__,{
/* harmony export */i:()=>/* binding */getAccessToken});
/* harmony import */var _global_Constants_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(824);
/* harmony import */var _utils_storage_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(566);const key=(type,server)=>`${type}_${_global_Constants_js__WEBPACK_IMPORTED_MODULE_0__.Vp[server].TOKEN_PREFIX}`;function saveData(server,data){(0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_1__.XO)(key("access_token",server),data.access);(0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_1__.XO)(key("access_expiration",server),Date.parse(data.access_expiration));if(data.refresh){(0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_1__.XO)(key("refresh_token",server),data.refresh);(0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_1__.XO)(key("refresh_expiration",server),Date.parse(data.refresh_expiration))}}
// Login and store tokens
async function login(server){const url=`${_global_Constants_js__WEBPACK_IMPORTED_MODULE_0__.Vp[server].BASE_URL}/login/`;try{const response=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:_global_Constants_js__WEBPACK_IMPORTED_MODULE_0__.Vp[server].USERNAME,password:_global_Constants_js__WEBPACK_IMPORTED_MODULE_0__.Vp[server].PASSWORD})});const data=await response.json();saveData(server,data)}catch(e){console.error(`Error logging in: ${e}`)}}
// Use refresh token to get new access token
async function apiCallForAccessToken(server){try{const refreshToken=(0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_1__.bQ)(key("refresh_token",server));const url=`${_global_Constants_js__WEBPACK_IMPORTED_MODULE_0__.Vp[server].BASE_URL}/token/refresh/`;const res=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refresh:refreshToken})});if(!res.ok)throw new Error(await res.text());const data=await res.json();saveData(server,data);return data.access}catch(error){console.error(`Failed to refresh token: ${error}`)}}
// Check if token is still valid (over 3 minutes left)
function isTokenValid(tokenName){const expirationTimestamp=Number((0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_1__.bQ)(tokenName));if(isNaN(expirationTimestamp)){console.warn(`Invalid expiration date for ${tokenName}:`,expirationTimestamp);return false}return expirationTimestamp-Date.now()>18e4}
// Main access token getter
async function getAccessToken(server){const accessTokenKey=key("access_token",server);const accessExpKey=key("access_expiration",server);const refreshExpKey=key("refresh_expiration",server);
// console.log("Access Token is valid? ", isTokenValid(accessExpKey));
// access token is valid
if(isTokenValid(accessExpKey))return(0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_1__.bQ)(accessTokenKey);
// console.log("Refresh Token is valid? ", isTokenValid(refreshExpKey));
// access token is expired but refresh key is valid
if(isTokenValid(refreshExpKey))return await apiCallForAccessToken(server);await login(server);return(0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_1__.bQ)(accessTokenKey)}},59:(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{
// EXPORTS
__webpack_require__.d(__webpack_exports__,{RG:()=>/* binding */download,HK:()=>/* binding */getNhsId});
// UNUSED EXPORTS: fetchNhsId
// EXTERNAL MODULE: ./src/global/Constants.js
var Constants=__webpack_require__(824);// ./src/toolbar/createModal.js
function createModal(onSelect){
// container
const modal=document.createElement("div");modal.id="nhsID-modal";modal.style.cssText=`
    position: fixed;
    left: 50%;
    top: 20%;
    transform: translate(-50%, 0);
    background: white;
    border: 1px solid #ccc;
    z-index: 1000;
    padding: 1rem;
    width: 400px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  `;
// Search input
const input=document.createElement("input");input.type="text";input.placeholder="Search NHS ID...";input.style.cssText=`
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  `;
// Results container
const resultsContainer=document.createElement("div");resultsContainer.style.cssText=`
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 0.5rem;
    background: #f9f9f9;
  `;
// No results message placeholder
const noResults=document.createElement("p");noResults.textContent="No results were found that match the search criteria.";noResults.style.cssText="color: red; text-align: center; display: none;";
// Close button
const closeButton=document.createElement("button");closeButton.textContent="Cancel";closeButton.style.cssText=`
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: red;
    color: white;
    border: none;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 4px;
  `;closeButton.addEventListener("click",(()=>{modal.remove();// Clean up modal on close
onSelect(null)}));
// Append input and results to modal
modal.appendChild(closeButton);modal.appendChild(input);modal.appendChild(resultsContainer);modal.appendChild(noResults);document.body.appendChild(modal);
// Debounce function
function debounce(func,delay){let timeout;return(...args)=>{clearTimeout(timeout);timeout=setTimeout((()=>func(...args)),delay)}}
// Fetch results function
const fetchResults=async()=>{const searchText=input.value.trim();if(!searchText){resultsContainer.innerHTML="";noResults.style.display="none";return}
// Show a loading indicator
resultsContainer.innerHTML="<p>Loading...</p>";const token=document.querySelector("input[name=__RequestVerificationToken]")?.value;const activeLetter=document.querySelector("#document_list > li > a.active");const documentId=activeLetter?.getAttribute("data-id");try{const formData=new FormData;formData.append("__RequestVerificationToken",token);formData.append("documentId",documentId);formData.append("searchText",searchText);formData.append("X-Requested-With","XMLHttpRequest");
// const response = await fetch(CONFIG.DOCMAN_URL + "/Filing/ItemSearch", {
//   method: "POST",
//   headers: {
//     accept: "*/*",
//     "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
//     "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
//     "x-requested-with": "XMLHttpRequest",
//   },
//   body: formData,
// });
const response=await fetch("/Filing/ItemSearch",{method:"POST",body:formData,credentials:"include",// or "include" if you're on another subdomain
headers:{"X-Requested-With":"XMLHttpRequest"}});
// console.log("Response of createModal: ", response);
// Check for redirection or empty results
if(response.redirected||!response.ok){resultsContainer.innerHTML="";noResults.style.display="block";return}
// Parse the response HTML
const responseText=await response.text();console.log("Raw HTML from /Filing/ItemSearch:",responseText);const parser=new DOMParser;const doc=parser.parseFromString(responseText,"text/html");const resultItems=doc.querySelectorAll("#dm-search-result-list li");
// Display results
if(resultItems.length===0){resultsContainer.innerHTML="";noResults.style.display="block";return}resultsContainer.innerHTML="";noResults.style.display="none";resultItems.forEach((item=>{const surname=item.querySelector(".surname")?.textContent||"";const forename=item.querySelector(".forename")?.textContent||"";const title=item.querySelector(".title")?.textContent||"";const date=item.querySelector(".date")?.textContent||"";const age=item.querySelector(".age")?.textContent||"";const nhs=item.querySelector(".nhs")?.textContent||"";const address=item.querySelector("small:last-of-type")?.textContent||"";const resultItem=document.createElement("div");resultItem.style.cssText=`
          padding: 0.5rem;
          margin-bottom: 0.5rem;
          border: 1px solid #ccc;
          background: white;
          border-radius: 4px;
          cursor: pointer;
        `;resultItem.innerHTML=`
          <strong>${surname}, ${forename} (${title})</strong><br>
          <i>Born:</i> ${date} (${age}) &nbsp;&nbsp; <i>NHS #:</i> ${nhs}<br>
          ${address}
        `;resultItem.addEventListener("click",(()=>{modal.remove();// Clean up modal
onSelect(nhs)}));resultsContainer.appendChild(resultItem)}))}catch{resultsContainer.innerHTML="<p style='color: red;'>An error occurred while searching. Please try again.</p>"}};
// Add input event listener with debounce
input.addEventListener("input",debounce(fetchResults,500))}
// EXTERNAL MODULE: ./src/utils/helpers.js
var helpers=__webpack_require__(854);
// EXTERNAL MODULE: ./src/handlers/fetch_from_backend.js
var fetch_from_backend=__webpack_require__(301);// ./src/api/myapi.js
const TLSCL_IPS=["docman.zaeem.uk"];async function convertToHash(pdf,guid=false){const formData=new FormData;const blob=new Blob([pdf]);formData.append("file",blob,"document.pdf");formData.append("guid",guid);try{const res=await(0,fetch_from_backend.t2)(2,`/emis_docman/gen_hash/`,`Gen Hash Request to Shary`,"POST",formData);const json=await res.json();return{status:"passed",message:"Hash generated successfully.",...json}}catch(err){const msg=err.message;
// console.log("message:", msg);
// Handle expected 409 conflict
const parsed=JSON.parse(msg);if(parsed?.guid?.[0]==="GUID already exists.")return{status:"skipped",message:"GUID already exists in backend.",guid};
// Unexpected failure
return{status:"failed",message:`[convertToHash] Backend failed: ${msg}`}}}async function convertToPDF(tiff){if(!tiff||tiff.size===0)throw new Error("Invalid TIFF file provided for conversion.");const formData=new FormData;const blob=new Blob([tiff],{type:"application/octet-stream"});formData.append("file",blob,"document.tiff");try{const res=await(0,fetch_from_backend.t2)(2,`/emis_docman/gen_pdf/`,"Gen PDF Request","POST",formData);const pdfBlob=await res.blob();return pdfBlob}catch(error){console.error("ConvertToPDF by deployed Backend Failed",error);
// alert("Failed to convert TIFF to PDF. Please try again later.");
// const url = URL.createObjectURL(blob);
// const a = document.createElement("a");
// a.href = url;
// a.download = "error_gen_pdf.tiff";
// document.body.appendChild(a);
// a.click();
// document.body.removeChild(a);
// URL.revokeObjectURL(url);
for(const ip of TLSCL_IPS){const response=await fetch(`https://${ip}/convert-tiff-to-pdf`,{headers:{"x-auth-header":"10000001-6000-0000-0009-100000000001",Authorization:"10000001-6000-0000-0009-100000000001"},method:"POST",body:formData});if(!response.status===200)continue;return await response.blob()}}}async function convertToOCR(pdf){const formData=new FormData;const blob=new Blob([pdf],{type:"application/pdf"});formData.append("file",blob,"document.pdf");try{const res=await(0,fetch_from_backend.t2)(1,`/r2d2/utils/pdf2text/`,"Convert Pdf to Text","POST",formData);const json=await res.json();return json.pdf_text}catch(error){console.error("ConvertToPDF by deployed Backend Failed",error);
// alert("Failed to convert PDF to text. Please try again later.");
// const url = URL.createObjectURL(blob);
// const a = document.createElement("a");
// a.href = url;
// a.download = "error_pdf_2_text.pdf";
// document.body.appendChild(a);
// a.click();
// document.body.removeChild(a);
// URL.revokeObjectURL(url);
for(const ip of TLSCL_IPS){const response=await fetch(`https://${ip}/ocr`,{headers:{"x-auth-header":"10000001-6000-0000-0009-100000000001",Authorization:"10000001-6000-0000-0009-100000000001"},method:"POST",body:formData});const json=await response.json();// parse the json from response
return json.ocr[0]}}}// ./src/api/docman.js
async function download(RequestVerificationToken,guid,filename,pdf,result,step="Download Letter"){const substep=`POST ${Constants.PI.DOCMAN_DOWNLOAD_URL}`;async function tryFetchDownload(){const response=await fetch(Constants.PI.DOCMAN_URL+Constants.PI.DOCMAN_DOWNLOAD_URL,{headers:{accept:"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7","accept-language":"en-GB,en-US;q=0.9,en;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded"},body:`__RequestVerificationToken=${RequestVerificationToken}&documentGuids%5B0%5D=${guid}`,method:"POST"});return response}async function handleResponse(response){if(response.status!==200){const msg=`HTTP ${response.status} when downloading`;result?.addSubRes(step,substep,msg);return false}{result?.addSubRes(step,substep,"download response is ok");const arraybuffer=await response.arrayBuffer();let pdfBlob;try{pdfBlob=await convertToPDF(arraybuffer)}catch(error){console.error("Error from pdf blob: ",error);return false}
// console.log("pdf blob: ", pdfBlob);
// alert(`1-check pdf blob response`);
if(!pdfBlob||pdfBlob.size<100){result?.addSubRes(step,substep,"PDF blob too small (< 100 bytes)");return false}result?.addSubRes(step,substep,"Convert to pdf Successfully");if(pdf==1){const link=document.createElement("a");link.href=URL.createObjectURL(pdfBlob);link.download=filename;link.click();
// new
const res=await convertToHash(pdfBlob,guid);result?.addSubRes(step,substep,`${res.message||"No response message"} with option 1`);return res}if(pdf==-1){const json=await convertToOCR(pdfBlob);result?.addSubRes(step,substep,`Handle Response with option -1`);return json}}}try{const response=await tryFetchDownload();const success=await handleResponse(response);// ✅
// console.log("First attempt: ", success);
// alert(`2-see the response on console`);
if(success){result?.addSubRes(step,substep,`First download attempt successful`);return success}result?.addSubRes(step,substep,`First download attempt failed`);const conversionTriggered=await(0,helpers.kd)(1e4,result);
// alert("3- conversionTriggered", conversionTriggered);
if(!conversionTriggered){result?.addSubRes(step,substep,"Conversion not triggered or failed.");return false}result?.addSubRes(step,substep,"Conversion Triggered");await(0,helpers.cb)(5e3);const retryResponse=await tryFetchDownload();
// console.log("Second attempt: ", retryResponse);
// alert(`4- Second attempt `);
return await handleResponse(retryResponse)}catch(error){result?.addSubRes(step,substep,`Exceptional problem, failed to download after 2 attempts`).setError(error);return false}}async function fetchNhsId(RequestVerificationToken,batchFolderId,documentId,result,step="Fetch NHS ID"){const substep="POST /Filing/BeginFilingFromBatch";try{const res=await fetch(Constants.PI.DOCMAN_URL+`/Filing/BeginFilingFromBatch`,{headers:{accept:"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7","accept-language":"en-GB,en-US;q=0.9,en;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded"},body:`__RequestVerificationToken=${RequestVerificationToken}&BatchFolderId=${batchFolderId}&DocumentId=${documentId}&DocumentIdsToMerge=&FileToItemId=0&FileToSectionId=2&UseIntellisense=true`,method:"POST"});const response=await res.text();const parser=new DOMParser;const doc=parser.parseFromString(response,"text/html");let nhsID=doc.querySelector("strong.nhs")?.textContent.replace(/ /g,"");if(nhsID){
// console.log("NHS ID found in intellisense:", nhsID);
result.addSubRes(step,substep,`NHS ID found in intellisense: ${nhsID}`);return nhsID}{const nhsIDs=doc.querySelectorAll(".nhs");result.addSubRes(step,substep,"Multiple NHS IDs returned");return nhsIDs}}catch(error){
// console.log(`Error fetching NHS ID: ${error}`);
result.addSubRes(step,substep,"Error fetching NHS ID").setError(error);return null}}async function getNhsId(letter,rvt,result,step="Get NHS ID"){let nhsID=document.querySelector("strong.nhs")?.textContent.replace(/ /g,"");if(nhsID){result.addSubRes(step,"Found NHS ID in letter",nhsID);return nhsID}const batchFolderId=document.querySelector("#folders_list a.active").getAttribute("data-id");const documentId=letter.getAttribute("data-id");nhsID=await fetchNhsId(rvt,batchFolderId,documentId,result,"Get NHS ID");
// console.log("nhsId: ", nhsID);
if(nhsID instanceof NodeList){console.log("Multiple NHS IDs found, prompting user to select one.");return new Promise((resolve=>{createModal((
// callback function to handle the selected NHS ID
selectedNhsID=>{if(selectedNhsID){const cleanID=selectedNhsID.replace(/ /g,"");result.addSubRes(step,"User selected NHS ID",cleanID);resolve(cleanID)}else{result.addSubRes(step,"User selected NHS ID","None");resolve(null)}}))}))}return nhsID}},824:(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{
/* harmony export */__webpack_require__.d(__webpack_exports__,{
/* harmony export */PI:()=>/* binding */CONFIG,
/* harmony export */Sx:()=>/* binding */EMIS_UPDATE_REQUIRED_LETTER_TYPES,
/* harmony export */Vp:()=>/* binding */SERVERS,
/* harmony export */ai:()=>/* binding */enableActionButton,
/* harmony export */e_:()=>/* binding */LETTER_CODES});
/* unused harmony export revertToBack */
/* harmony import */var _utils_storage_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(566);const enableActionButton=true;let client_Id=(0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_0__.bQ)("Inst_Id")||false;let client_name=(0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_0__.bQ)("Client_name")||false;const CONFIG={DOCMAN_DOWNLOAD_URL:`/Document/Download`,get DOCMAN_URL(){return localStorage.getItem("KYNOBY_DOCMAN_URL")||`https://production.docman.thirdparty.nhs.uk`},INSTANCE_ID:client_Id,Client_Name:client_name,MARK_LETTER_COMPLETE:client_Id=="BMC_001"};const EMIS_UPDATE_REQUIRED_LETTER_TYPES=["INR","Retinal Screening"];const SERVERS={1:{BASE_URL:"https://reza-be-prod-oz3cr.kinsta.app",TOKEN_PREFIX:"1",USERNAME:"c3po@kynoby.com",PASSWORD:"qweasd321"},2:{BASE_URL:"https://sharybeautomation-9qrox.kinsta.app",TOKEN_PREFIX:"2",USERNAME:"automation_server@kynoby.com",PASSWORD:"a78678600"},3:{BASE_URL:"https://reza-be-prod-replica-6uqhs.kinsta.app",TOKEN_PREFIX:"3",USERNAME:"c3po@kynoby.com",PASSWORD:"qweasd321"}};const LETTER_CODES={H06z1:{term:"Respiratory tract infection",snomed:275498002},XaKqd:{term:"Letter received",snomed:0xb458389dfe69,type:"Additional"},"9N19.":{term:"Seen by Accident and Emergency service",snomed:4525004,type:"Additional"},XaBTN:{term:"Seen by Accident and Emergency service",snomed:4525004,type:"Additional"},XaIjP:{term:"Prescription by another organisation",snomed:394828003,type:"Additional"},XaXpb:{term:"Did not attend abdominal aortic aneurysm screening",snomed:736815004,type:"Additional"},SD000:{term:"Abrasion of face",snomed:210987008},XaLLL:{term:"Did not attend retinal screening",snomed:0xb77dd0b02668,type:"Additional"},Xad2m:{term:"NHS abdominal aortic aneurysm screening programme initial screening, normal result",snomed:982101000000106,type:"Additional"},XaYVr:{term:"Abdominal aortic aneurysm screen ultrasound scan abnormal",snomed:809101000000106},Xa23I:{term:"Diagnosis not made",snomed:3425471013,type:"Additional"},Y303f:{term:"Left care setting before initial assessment",snomed:0x3c9cb8c542267,type:"Additional"},Xa2jh:{term:"Facial laceration",snomed:370247008},"52...":{term:"Plain film",snomed:168537006,type:"Additional"},"32...":{term:"Electrocardiographic procedure",snomed:29303009,type:"Additional"},"567..":{term:"CT - Computerised tomography",snomed:77477e3,type:"Additional"},XA0GV:{term:"Fracture of radius",snomed:12676007},"C10..":{term:"Diabetes mellitus",snomed:73211009},XagSV:{term:"Mental health problem",snomed:413307004},XE0LE:{term:"Surgical removal of impacted tooth",snomed:234673006,type:"Additional"},Xa41m:{term:"Bruise fingers/thumb",snomed:288286e3},"SE0..":{term:"Brusie of face",snomed:125668004},"SH0..":{term:"Corneal burns",snomed:274204004},"SE02.":{term:"Nose - bruise",snomed:60897004},XA00D:{term:"Wrist injury",snomed:125598003},XA0Hb:{term:"Fracture of fibula",snomed:75591007},"81H..":{term:"Dressing of wound",snomed:182531007,type:"Additional"},XA004:{term:"Head injury",snomed:82271004},XE1JW:{term:"Musculoskeletal finding",snomed:106028002},XaIPi:{term:"Digital retinal screening",snomed:390852004,type:"Additional"},XaL1S:{term:"Did not attend diabetic retinopathy clinic",snomed:0xb543614ef264,type:"Additional"},XaPjM:{term:"Diabetic retinopathy screening declined",snomed:839811000000106,type:"Additional"},XaJkQ:{term:"Diabetic retinopathy screening refused",snomed:413122001,type:"Additional"},XaKaW:{term:"Diabetic retinopathy screening offered",snomed:0x3ebcf6a0b1266,type:"Additional"},XaJLa:{term:"Diabetic retinopathy 12 month review",snomed:408384004,type:"Additional"},XaJLb:{term:"Diabetic retinopathy 6 month review",snomed:408385003,type:"Additional"},"2B6..":{term:"O/E - visual acuity R-eye",snomed:163935006,type:"Additional"},"2B61.":{term:"O/E - visual acuity R-eye =6/5",snomed:163936007,type:"Additional"},"2B62.":{term:"O/E - visual acuity R-eye =6/6",snomed:163937003,type:"Additional"},"2B63.":{term:"O/E - visual acuity R-eye =6/9",snomed:163938008,type:"Additional"},"2B6Z.":{term:"O/E - visual acuity R-eye",snomed:163935006,type:"Additional"},"2B64.":{term:"O/E - visual acuity R-eye=6/12",snomed:163939e3,type:"Additional"},"2B65.":{term:"O/E - visual acuity R-eye=6/18",snomed:163940003,type:"Additional"},"2B66.":{term:"O/E - visual acuity R-eye=6/24",snomed:163941004,type:"Additional"},"2B67.":{term:"O/E - visual acuity R-eye=6/36",snomed:163942006,type:"Additional"},XaIOa:{term:"O/E - visual acuity R-eye=6/4",snomed:390803003,type:"Additional"},"2B68.":{term:"O/E - visual acuity R-eye=6/60",snomed:163943001,type:"Additional"},XaKNH:{term:"O/E- visual acuity R-eye =6/15",snomed:416793003,type:"Additional"},XaIPg:{term:"O/E - no right diabetic retinopathy",snomed:390850007,type:"Additional"},XaJOg:{term:"O/E - right eye background diabetic retinopathy",snomed:408409007,type:"Additional"},XaJOi:{term:"O/E - right eye preproliferative diabetic retinopathy",snomed:408411003,type:"Additional"},XaJOk:{term:"O/E - right eye proliferative diabetic retinopathy",snomed:408413e3,type:"Additional"},XaKDG:{term:"O/E - right eye stable treated proliferative diabetic retinopathy",snomed:414910007,type:"Additional"},XaKCJ:{term:"O/E - right eye no maculopathy",snomed:414909002,type:"Additional"},XaJOn:{term:"Maculopathy of right eye with diabetes mellitus",snomed:769244003,type:"Additional"},XE1i1:{term:"O/E-R-eye perceives light only",snomed:268973006,type:"Additional"},"2B69.":{term:"O/E -R-eye counts fingers only",snomed:163944007,type:"Additional"},XaBLI:{term:"O/E - R-eye sees hand movements",snomed:308082007,type:"Additional"},"2B7..":{term:"O/E - visual acuity L-eye",snomed:163949002,type:"Additional"},XaIOc:{term:"O/E - visual acuity L-eye =6/4",snomed:390805005,type:"Additional"},"2B71.":{term:"O/E - visual acuity L-eye =6/5",snomed:163950002,type:"Additional"},"2B72.":{term:"O/E - visual acuity L-eye =6/6",snomed:163951003,type:"Additional"},"2B73.":{term:"O/E - visual acuity L-eye =6/9",snomed:163952005,type:"Additional"},"2B7Z.":{term:"O/E - visual acuity L-eye",snomed:163949002,type:"Additional"},"2B74.":{term:"O/E - visual acuity L-eye=6/12",snomed:163953e3,type:"Additional"},"2B75.":{term:"O/E - visual acuity L-eye=6/18",snomed:163954006,type:"Additional"},"2B76.":{term:"O/E - visual acuity L-eye=6/24",snomed:163955007,type:"Additional"},"2B77.":{term:"O/E - visual acuity L-eye=6/36",snomed:163956008,type:"Additional"},"2B78.":{term:"O/E - visual acuity L-eye=6/60",snomed:163957004,type:"Additional"},XaIPj:{term:"O/E - no left diabetic retinopathy",snomed:390853009,type:"Additional"},XaJOh:{term:"O/E - left eye background diabetic retinopathy",snomed:408410002,type:"Additional"},XaJOj:{term:"O/E - left eye preproliferative diabetic retinopathy",snomed:408412005,type:"Additional"},XaJOl:{term:"O/E - left eye proliferative diabetic retinopathy",snomed:408414006,type:"Additional"},XaKDH:{term:"O/E - left eye stable treated proliferative diabetic retinopathy",snomed:414894003,type:"Additional"},XaKCK:{term:"O/E - left eye no maculopathy",snomed:414893009,type:"Additional"},XaB9u:{term:"Anticoagulant monitoring",snomed:307571006,type:"Additional"},XaVxK:{term:"Attended breast screening clinic",snomed:473396004,type:"Additional"},"5372.":{term:"Mammography normal",snomed:168749009,type:"Additional"},"5373.":{term:"Mammography abnormal",snomed:168750009},X75l7:{term:"Posterior vitreous detachment",snomed:247081001},"1B88.":{term:"Dry eyes",snomed:162290004},X00PF:{term:"Injection into vitreous body",snomed:231334e3,type:"Additional"},XE18j:{term:"Age-related macular degeneration",snomed:267718e3},XaATf:{term:"Seen by ophthalmologist",snomed:305721007,type:"Additional"},"9K0..":{term:"Form GOS18 Ophthalmic referral",snomed:1951000000106,type:"Additional"},72560:{term:"Laser trabeculoplasty",snomed:172485001,type:"Additional"}}},176:(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{
// EXPORTS
__webpack_require__.d(__webpack_exports__,{p:()=>/* binding */moveLetters});
// EXTERNAL MODULE: ./src/toolbar/createMultiStepLoader.js
var createMultiStepLoader=__webpack_require__(529);
// EXTERNAL MODULE: ./src/utils/helpers.js
var helpers=__webpack_require__(854);
// EXTERNAL MODULE: ./src/api/docman.js + 2 modules
var docman=__webpack_require__(59);
// EXTERNAL MODULE: ./src/toolbar/createResult.js
var createResult=__webpack_require__(144);
// EXTERNAL MODULE: ./src/utils/document.js
var utils_document=__webpack_require__(974);// ./src/utils/processLetters.js
const processLetter=async(letter,progressPane,STRINGS_MAPPING)=>{const guid=letter.getAttribute("data-guid");const rvt=document.querySelector("input[name='__RequestVerificationToken']")?.value;let success;const result=(0,createResult.A)({guid,rvt});try{success=await(0,docman.RG)(rvt,guid,"ocr",-1,result);if(!success){progressPane?.updateStep(letter,"Download Letter","fail");return result.addRes("Download Letter","fail",`Download Response: ${JSON.stringify(success)}`).build()}progressPane?.updateStep(letter,"Download Letter",`success`);result.addRes("Download Letter",`success`)}catch(e){progressPane?.updateStep(letter,"Download Letter","fail");return result.addRes("Download Letter","fail",`Download Error: ${JSON.stringify(e)}`).setError(e).build()}
// const ocr = await success?.ocr[0]?.toLowerCase().trim();
const ocr=await(success?.toLowerCase().trim());if(!ocr){progressPane?.updateStep(letter,"Parse OCR","fail");return result.addRes("Parse OCR","fail",`Failed to parse OCR from response: ${JSON.stringify(ocr)}`).build()}progressPane?.updateStep(letter,"Parse OCR","success");result.addRes("Parse OCR",`succuss`);let rename=false,folder=false;
// for (const mapping of STRINGS_MAPPING) {
//   const nameMatch = ocr.includes(mapping.name.toLowerCase());
//   let additionalMatch = false;
//   if (mapping.additional_matches) {
//     const matchesArray = mapping.additional_matches
//       .split(",")
//       .map((s) => s.trim().toLowerCase());
//     additionalMatch = matchesArray.some((match) => ocr.includes(match));
//   }
//   if (nameMatch || additionalMatch) {
//     rename = mapping.rename;
//     folder = mapping.folder;
//     break;
//   }
// }
for(const mapping of STRINGS_MAPPING){const nameMatch=ocr.includes(mapping.name.toLowerCase());/// yes
let additionalMatch=false;if(mapping.additional_matches){const matchesArray=mapping.additional_matches.split(",").map((s=>s.trim().toLowerCase()));additionalMatch=matchesArray.some((match=>ocr.includes(match)))}if(nameMatch){if(additionalMatch){rename=mapping.rename;folder=mapping.folder;break}rename=mapping.rename;folder=mapping.folder;break}}if(!rename||!folder)return result.setSkip({rename:`Rename Letter: ${rename}`,folder:`Change Folder: ${folder}`}).build();await(0,helpers.cb)(500);try{progressPane?.addStep(letter,"Rename & Change Folder");await(0,utils_document.lF)(rename);await(0,helpers.cb)(1e3);await(0,utils_document.nR)(folder);progressPane?.updateStep(letter,"Rename & Change Folder","success");result.addRes("Rename & Change Folder","success",`Renamed to ${rename} and moved to ${folder}`)}catch(err){progressPane?.updateStep(letter,"Rename & Change Folder","fail");console.error("Error while renaming and changing folder: ",err);return result.addRes("Rename & Change Folder","fail",`Renamed to ${rename} and moved to ${folder}`).setError(err).build()}return result.build()};
// EXTERNAL MODULE: ./src/utils/storage.js
var storage=__webpack_require__(566);// ./src/handlers/autoMove.js
async function moveLetters(fromSelected=false){let startDate=false;let onlySelected=false;// ✅ New flag
// get start date or mode from user
while(!startDate&&startDate!=="false")startDate=prompt("Start date OR Type 'From Selected' OR 'Only Selected' :: Format: 19-Nov-2024","From Selected");if(startDate.toLowerCase()==="from selected")fromSelected=true;else if(startDate.toLowerCase()==="only selected"){onlySelected=true;fromSelected=true}
// find starting letter
let letters=Array.from(document.querySelectorAll("ul#document_list > li > a"));let startingLetter;startingLetter=fromSelected?document.querySelector("ul#document_list > li > a.active"):letters.find((letter=>letter.querySelector("small.date")?.textContent.includes(startDate)));if(!startingLetter){alert("Automation exiting: Could not find letter with selected start date");return}(0,helpers.jM)(startingLetter);await(0,helpers.cb)(1e3);let index=letters.indexOf(startingLetter);const lettersFromSelected=onlySelected?[startingLetter]:letters.slice(index);// ✅ original behavior
const stepsPerLetter=["Download Letter","Parse OCR"];const progressPane=(0,createMultiStepLoader.p)("moveLetters",lettersFromSelected,stepsPerLetter);const STRINGS_MAPPING=await JSON.parse((0,storage.bQ)("STRINGS"));await(0,helpers.cb)(1e3);// Wait for the page to load
// iterate only selected or rest of the list
while(index<letters.length){let letter=letters[index];if(!letter){console.warn(`⚠️ Letter at index ${index} is undefined! Skipping.`);index++;letters=Array.from(document.querySelectorAll("ul#document_list > li > a"));continue}if(!document.body.contains(letter)){console.warn(`🚫 Letter at index ${index} has been removed from the DOM. Skipping.`);index++;letters=Array.from(document.querySelectorAll("ul#document_list > li > a"));continue}(0,helpers.jM)(letter);await(0,helpers.cb)(2e3);
// progress tracking
progressPane.updateLetterTitleStates(letter);const result=await processLetter(letter,progressPane,STRINGS_MAPPING);if(result.status==="fail"){progressPane.markLetterFailed(letter,result);index++}else if(result.status==="skip"){progressPane.markLetterSkip(letter,result);index++}else if(result.status==="success")progressPane.markLetterComplete(letter,result);else{console.warn("❓ Unknown result status:",result.status);index++}letters=Array.from(document.querySelectorAll("ul#document_list > li > a"));if(onlySelected)break}}},644:(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{
/* harmony export */__webpack_require__.d(__webpack_exports__,{
/* harmony export */K:()=>/* binding */autoPickup});
/* harmony import */var _utils_helpers_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(854);
/* harmony import */var _utils_storage_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(566);
/* harmony import */var _uploader_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(60);async function autoPickup(){const checkReady=setInterval((async()=>{if(window.location.href.includes("/Filing/BeginFilingFromBatch")||window.location.href.includes("/Filing/ConfirmFilingSectionItem")){if(document.readyState==="complete"||document.querySelector(".control-label")){clearInterval(checkReady);(0,_uploader_js__WEBPACK_IMPORTED_MODULE_2__.MI)()}}else if(window.location.href.includes("/TasksViewer/Tasks")||window.location.href.includes("/TasksViewer/ShowProcessTask")){if(document.querySelector("li[data-id='action_addclinicalcode'] > a")){clearInterval(checkReady);(0,_uploader_js__WEBPACK_IMPORTED_MODULE_2__.Eo)()}}else if(window.location.href.includes("/DocumentViewer/Filing")&&(0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_1__.bQ)("KYNOBY_UNATTENDED")=="true"){clearInterval(checkReady);if(document.readyState==="complete"){const folderID=(0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_1__.bQ)("KYNOBY_UNATTENDED_FOLDER");(0,_utils_helpers_js__WEBPACK_IMPORTED_MODULE_0__.jM)(document.querySelector(`#folders_list a[data-id='${folderID}']`));await(0,_utils_helpers_js__WEBPACK_IMPORTED_MODULE_0__.cb)(2e3);(0,_uploader_js__WEBPACK_IMPORTED_MODULE_2__.ge)(true,folderID)}}else clearInterval(checkReady)}),100)}},615:(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{
/* harmony export */__webpack_require__.d(__webpack_exports__,{
/* harmony export */W:()=>/* binding */extractDocuments});
/* harmony import */var _api_docman_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(59);
/* harmony import */var _toolbar_createMultiStepLoader_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(529);
/* harmony import */var _toolbar_createResult_js__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__(144);
/* harmony import */var _utils_helpers_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(854);async function extractDocuments(fromSelected=false){if(!window.location.href.includes("DocumentViewer/Filing")){alert("You're on the wrong page!");return}const extractedLetters=new Set;const currentDate=(0,_utils_helpers_js__WEBPACK_IMPORTED_MODULE_2__.Yq)(new Date);
// find out the starting letter
const letters=document.querySelectorAll("ul#document_list > li > a");const activeLetter=document.querySelector("ul#document_list > li > a.active");let lettersForExtractiion=letters.length;
// If there's an active letter, update lettersForExtractiion to count only those after it
if(activeLetter){const activeIndex=[...letters].indexOf(activeLetter);lettersForExtractiion=letters.length-activeIndex}const HOW_MANY_LETTERS=parseInt(prompt("How many letters to extract?",lettersForExtractiion),10);if(isNaN(HOW_MANY_LETTERS)||HOW_MANY_LETTERS<=0){alert("Please enter a valid number of letters.");return}const startIndex=fromSelected?Math.max(0,Array.from(letters).findIndex((letter=>letter.classList.contains("active")))):0;const tempQ=Array.from(letters).slice(startIndex,startIndex+HOW_MANY_LETTERS);const steps=[];const progressPane=(0,_toolbar_createMultiStepLoader_js__WEBPACK_IMPORTED_MODULE_1__.p)("extract letters",tempQ,steps);await(0,_utils_helpers_js__WEBPACK_IMPORTED_MODULE_2__.cb)(2e3);// Wait for the page to load
for(const[i,letter]of tempQ.entries()){progressPane.updateLetterTitleStates(letter);const guid=letter.getAttribute("data-guid");const result=(0,_toolbar_createResult_js__WEBPACK_IMPORTED_MODULE_3__.A)({guid,letter});
// check for duplicates
if(extractedLetters.has(guid)){progressPane.addStep(letter,"Check Duplicate");progressPane.updateStep(letter,"Check Duplicate","success");result.setSkip({"Check Duplicate":`Already processed: ${guid}`});progressPane.markLetterSkip(letter,result.build());continue}["Fetch RVT","Get NHS ID","Download Letter"].forEach((curr=>progressPane.addStep(letter,curr)));try{
// Real Extraction Part
// Real Extraction Part
(0,_utils_helpers_js__WEBPACK_IMPORTED_MODULE_2__.jM)(letter,`Extract Document ${letter.outerHTML}`);await(0,_utils_helpers_js__WEBPACK_IMPORTED_MODULE_2__.aB)("#document_loading",1e4,500,"display: none");const rvt=document.querySelector("input[name='__RequestVerificationToken']")?.value;if(!rvt){progressPane.updateStep(letter,"Fetch RVT","fail");result.addRes("Fetch RVT","fail","Missing RVT");progressPane.markLetterFailed(letter,result.build());throw new Error("No RequestVerificationToken")}progressPane.updateStep(letter,"Fetch RVT","success");result.addRes("Fetch RVT","success").set("rvt",rvt);try{await(0,_utils_helpers_js__WEBPACK_IMPORTED_MODULE_2__.aB)("strong.nhs",5e3,500)}catch{}await(0,_utils_helpers_js__WEBPACK_IMPORTED_MODULE_2__.cb)(2e3);const nhsID=await(0,_api_docman_js__WEBPACK_IMPORTED_MODULE_0__.HK)(letter,rvt,result,"Get NHS ID");if(!nhsID){progressPane.updateStep(letter,"Get NHS ID","fail");result.addRes("Get NHS ID","fail","NHS ID not found");progressPane.markLetterFailed(letter,result.build());continue}progressPane.updateStep(letter,"Get NHS ID","success");result.addRes("Get NHS ID","success").set("nhsID",nhsID);const filename=`${i+1}-${nhsID}-${currentDate}.pdf`;const success=await(0,_api_docman_js__WEBPACK_IMPORTED_MODULE_0__.RG)(rvt,guid,filename,true,result);
// console.log(success);
if(!success||success.status==="failed"){progressPane.updateStep(letter,"Download Letter","fail");result.addRes("Download Letter","fail",`Download response: ${JSON.stringify(success)}`);progressPane.markLetterFailed(letter,result.build());continue}if(success.status==="skipped"){result.setSkip({download:`Download Letter: ${success.message}`});progressPane.markLetterSkip(letter,result.build());continue}extractedLetters.add(guid);progressPane.updateStep(letter,"Download Letter","success");result.addRes("Download Letter","success").set("filename",filename);progressPane.markLetterComplete(letter,result.build())}catch(err){progressPane.markLetterFailed(letter,result.setError(err).build())}}}},301:(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{
/* harmony export */__webpack_require__.d(__webpack_exports__,{
/* harmony export */$J:()=>/* binding */fetchAllFromShary,
/* harmony export */t2:()=>/* binding */fetchFromBackend});
/* unused harmony export endPoints */
/* harmony import */var _api_auth_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(834);
/* harmony import */var _global_Constants_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(824);
/* harmony import */var _utils_storage_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(566);
// can be changed in future if multiple clients are supported
// let client_Id = "shs_0001";
// let client_Id = "BMC_001";
let client_Id=(0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_2__.bQ)("Inst_Id");const endPoints={RPA_NOTE_FOLDERS:`/emis_docman/${client_Id}/rpa_notes_folder/`,STRINGS:`/emis_docman/${client_Id}/string_mapping/`,CUSTOM_LETTER_MAPPING:`/emis_docman/${client_Id}/custom_letter_mapping/`};const fetchFromBackend=async(server,endpoint,fetchFor,method="GET",body=null)=>{const accessToken=await(0,_api_auth_js__WEBPACK_IMPORTED_MODULE_0__.i)(server);const options={method,headers:{Authorization:`Bearer ${accessToken}`}};body&&method==="POST"&&(options.body=body);const res=await fetch(`${_global_Constants_js__WEBPACK_IMPORTED_MODULE_1__.Vp[server].BASE_URL}${endpoint}`,options);if(!res.ok){const json=await res.text();console.warn(`Response is not ok for ${fetchFor}`);throw new Error(json)}return res};const fetchAllFromShary=async(server=2)=>{const errors=[];
// checking if letter mappings, strings, rpa note folders already exist
const allExist=Object.keys(endPoints).every((key=>(0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_2__.bQ)(key)));if(allExist)return true;
// Fetch them only if not present in local storage
const promises=Object.entries(endPoints).map((async([key,endPoint])=>{try{const res=await fetchFromBackend(server,endPoint,key);const data=await res.json();(0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_2__.XO)(key,JSON.stringify(data))}catch(error){console.error(`Error fetching ${key}:`,error);errors.push({key,error})}}));await Promise.all(promises);
// manually reload the page
if(errors.length===0){window.location.reload();// Trigger full reload only if fetches succeeded
return true}return false}},60:(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{
// EXPORTS
__webpack_require__.d(__webpack_exports__,{Eo:()=>/* binding */addCodes,MI:()=>/* binding */fileDocument,ge:()=>/* binding */uploadDocuments});
// EXTERNAL MODULE: ./src/utils/document.js
var utils_document=__webpack_require__(974);
// EXTERNAL MODULE: ./src/utils/helpers.js
var helpers=__webpack_require__(854);
// EXTERNAL MODULE: ./src/utils/storage.js
var storage=__webpack_require__(566);
// EXTERNAL MODULE: ./src/api/docman.js + 2 modules
var docman=__webpack_require__(59);
// EXTERNAL MODULE: ./src/api/auth.js
var auth=__webpack_require__(834);
// EXTERNAL MODULE: ./src/global/Constants.js
var Constants=__webpack_require__(824);
// EXTERNAL MODULE: ./src/handlers/fetch_from_backend.js
var fetch_from_backend=__webpack_require__(301);// ./src/api/kynoby.js
async function fetchLetterDetails(guid,result,nhs_id=false,step="Fetch Letter Details"){const substep1="Download Letter";result?.addSubRes(step,substep1,"Started");let letterHash=null;let isManualFallback=false;
// Attempt to fetch image hashes
try{const res=await(0,fetch_from_backend.t2)(2,`/emis_docman/gen_hash/${guid}/`,"Fetch Letter Hashes");const json=await res.json();if(!json||!json?.image_hashes)throw new Error("Invalid or missing image hashes");letterHash=json.image_hashes.map((obj=>obj.hash_value)).join(",");result?.addSubRes(step,substep1,`Hash generated: ${letterHash}`)}catch(e){isManualFallback=true;result?.addSubRes(step,substep1,`Failed to generate hash – falling back to manual fetch. Reason: ${e.message||e}`)}const substep2="GET letter/approved/";result?.addSubRes(step,substep2,"Fetching letter details");try{const accessToken=await(0,auth.i)(1);const url=
// !isLetterExtractedManually && !isManualFallback && letterHash
!isManualFallback&&letterHash?`${Constants.Vp[1].BASE_URL}/r2d2/gp_assist/${Constants.PI.INSTANCE_ID}/letter/approved/?imgs_hashes=${letterHash}`:`${Constants.Vp[1].BASE_URL}/r2d2/gp_assist/${Constants.PI.INSTANCE_ID}/letter/approved/`;const response=await fetch(url,{method:"GET",headers:{"Content-Type":"application/json",Authorization:`Bearer ${accessToken}`}});if(!response.ok){const reason=response.status===502?"Not approved/locked":`Unknown error (HTTP ${response.status})`;result?.addSubRes(step,substep2,`Failed: ${reason}`);alert(`Failed to fetch letter details, reason: ${reason}`);return false}const text=await response.text();if(text.includes("upstream connect error or disconnect/reset before headers")){result?.addSubRes(step,substep2,"Upstream error received");return false}const parsed=JSON.parse(text);if(isManualFallback){const matched=parsed.find((item=>item.nhs_id===nhs_id));if(!matched){result?.addSubRes(step,substep2,"No letter details found for nhs_id");return false}if(matched.length>1){result?.addSubRes(step,substep2,"Multiple letters found for nhs_id");alert("Multiple letters found for the provided nhs_id. Please check manually.");return false}(0,storage.Jx)(matched);result?.addSubRes(step,substep2,"Success – Fetched letter manually using nhs_id");return true}(0,storage.Jx)(parsed);result?.addSubRes(step,substep2,"Success – Fetched letter via hash (automatic match)");return true}catch(e){result?.addSubRes(step,substep2,`Error fetching letter details`).setError(e);return false}}
// EXTERNAL MODULE: ./src/toolbar/createMultiStepLoader.js
var createMultiStepLoader=__webpack_require__(529);
// EXTERNAL MODULE: ./src/toolbar/createResult.js
var createResult=__webpack_require__(144);// ./src/utils/processClinicalCodes.js
const fetchForReadCode=async read_code=>{try{const res=await(0,fetch_from_backend.t2)(1,`/r2d2/gp_assist/ctv3?q=${read_code}`,`Fetch snomed for ${read_code}`);const data=await res.json();if(data?.results?.length>0){
// Return only if there's a case-sensitive exact match
const exactMatch=data.results.find((item=>item.child===read_code));if(exactMatch)return{snomed_code:exactMatch.snomed_code,code_term:exactMatch.code_term}}
// No exact match found
return{snomed_code:null,code_term:null}}catch(err){console.error("Failed to fetch fallback from backend:",err);return{snomed_code:null,code_term:null}}};async function processClinicalCodes({LETTER_DETAILS,nhsID,progressPane,task,result}){const stepTitle="Process clinical codes";const letterCodes=LETTER_DETAILS.letter_codes_list;for(const code of letterCodes){const{snomed_code:initialSnomed,c_term:initialTerm,child:read_code}=code;
// code = {
//     "id": 109714,
//     "child": "S36..",
//     "snomed_code": "21351003",
//     "c_term": "Fracture of phalanx of toe",
//     "qof": false,
//     "qof_flags": [],
//     "code_type": null,
//     "comments": null
//   }
const substepMain=`Processing ${read_code||"N/A"}`;progressPane.addSubStep(task,stepTitle,substepMain);if(!read_code){progressPane.updateSubStep(task,stepTitle,substepMain,"fail");result.addSubRes(stepTitle,substepMain,`Read Code not found: ${read_code??"N/A"}`).addRes(stepTitle,"fail").set("code",code);progressPane.markLetterFailed(task,result.build());return false}let snomed_code=initialSnomed;let code_term=initialTerm;
// Exceptiona; scenario of snoomed code
if(!snomed_code||!code_term){let promptRes="";while(promptRes.toLowerCase().trim()!=="done"){promptRes=prompt(`${!snomed_code&&"snomed code"} - ${!code_term&&"code_term"} for read code '${read_code}' does not exist.
NHS ID: ${nhsID}
Letter ID: ${LETTER_DETAILS.letter_id}.
Please Update it on backend and then write 'done' in promptBox`);result.addSubRes(stepTitle,substepMain,`Prompted for missing ${!snomed_code&&"snomed code"} - ${!code_term&&"code_term"}`)}let codesRes=await fetchForReadCode(read_code);snomed_code=codesRes.snomed_code||snomed_code;code_term=codesRes.code_term||code_term;
// if still not found the snomed code and code term
if(!snomed_code||!code_term){while(!snomed_code){snomed_code=prompt(`Still Missing 'snomed' for ${read_code}.
NHS ID: ${nhsID}
Letter ID: ${LETTER_DETAILS.letter_id}`);result.addSubRes(stepTitle,substepMain,`Prompted for missing SNOMED`)}while(!code_term){code_term=prompt(`Still Missing 'term' for ${read_code}.
NHS ID: ${nhsID}
Letter ID: ${LETTER_DETAILS.letter_id}`);result.addSubRes(stepTitle,substepMain,`Prompted for missing Term`)}}result.addSubRes(stepTitle,substepMain,`Snomed and code term found for ${read_code} from fallback`)}document.querySelector("li[data-id='action_addclinicalcode'] > a")?.dispatchEvent(new Event("click",{bubbles:true}));try{await(0,helpers.aB)("input#code_searchtext")}catch{progressPane.updateSubStep(task,stepTitle,substepMain,"fail");result.addSubRes(stepTitle,substepMain,"Code search bar could not be found").addRes(stepTitle,"fail");progressPane.markLetterFailed(task,result.build());return false}const input=document.querySelector("input#code_searchtext");(0,helpers.m$)(input,snomed_code);try{await(0,helpers.aB)("a.termtext",1e4)}catch{(0,storage.XO)("KYNOBY_LETTER_DETAILS","{}");progressPane.updateSubStep(task,stepTitle,substepMain,"fail");result.addSubRes(stepTitle,substepMain,`No terms found`).addRes(stepTitle,"fail");progressPane.markLetterFailed(task,result.build());return false}await(0,helpers.cb)(300);const terms=document.querySelectorAll("a.termtext");let found=[...terms].some((term=>{if(term.textContent.toLowerCase()===code_term.toLowerCase()){term.dispatchEvent(new Event("click",{bubbles:true}));return true}}));if(!found){for(const term of terms){(0,helpers.jM)(term,`${term} in addCodes`);await(0,helpers.cb)(1500);const termCode=document.querySelector("div.selectedCode small")?.textContent;if(termCode?.includes(snomed_code)){found=true;break}}
// if (!found) {
//   setData("KYNOBY_LETTER_DETAILS", "{}");
//   result.addSubRes(stepTitle, substepMain, "No matching term found");
//   progressPane.markLetterFailed(task, result.build());
//   return false;
// }
if(!found){const availableTerms=[...terms].map(((term,i)=>`${i+1}. ${term.textContent}`)).join("\n");const selection=prompt(`No exact match found.
Please select the correct code term manually:
${availableTerms}
Count the number of exact term and Enter it here:`);const selectedIndex=parseInt(selection,10)-1;if(isNaN(selectedIndex)||!terms[selectedIndex]){(0,storage.XO)("KYNOBY_LETTER_DETAILS","{}");result.addSubRes(stepTitle,substepMain,"No matching term found");progressPane.markLetterFailed(task,result.build());return false}terms[selectedIndex].dispatchEvent(new Event("click",{bubbles:true}));found=true}}result.addSubRes(stepTitle,substepMain,`Matched term for ${read_code}`);document.querySelector("a#clinicalcodebrowser_confirm")?.dispatchEvent(new Event("click",{bubbles:true}));await(0,helpers.cb)(2500);try{await(0,helpers.aB)("#medicalhistory_lookup small")}catch{(0,storage.XO)("KYNOBY_LETTER_DETAILS","{}");progressPane.updateSubStep(task,stepTitle,substepMain,"fail");result.addSubRes(stepTitle,substepMain,`Could not find medical history lookup`).addRes(stepTitle,"fail");progressPane.markLetterFailed(task,result.build());return false}while(document.querySelector("#medicalhistory_lookup small").textContent.toLowerCase().includes("checking medical history"))await(0,helpers.cb)(1e3);
// decoding a stringified Python-style list of dicts into a valid JavaScript object
const treatmentProcedure=JSON.parse(LETTER_DETAILS?.treatment_procedure?.replace(/([{,]\s*)'([^']+?)'\s*:/g,'$1"$2":').replace(/:\s*'([^']+?)'/g,': "$1"').replace(/\bNone\b/g,"null")||"[]");
// const { type } = await fetchForReadCode(read_code);
const codeType=Constants.e_?.[read_code]?.type||treatmentProcedure?.find((({Code})=>Code===read_code))?"Additional":"";if(codeType==="Additional"||document.querySelector("#medicalhistory_lookup small").textContent.match(/Found \d+ previously coded terms/)){const optionsEl=document.querySelector("#Heading");[...optionsEl.options].forEach((option=>{if(option.innerHTML.includes("Additional")){option.selected=true;optionsEl.dispatchEvent(new Event("change",{bubbles:true}))}}))}
// document
//   .querySelector("#add-clinicalcode-form")
//   ?.dispatchEvent(new Event("submit", { bubbles: true }));
document.querySelector("#addclinicalcode_confirm").click();await(0,helpers.cb)(2e3);progressPane.updateSubStep(task,stepTitle,substepMain,"success")}progressPane.updateStep(task,stepTitle,"success");result.addRes(stepTitle,"success");return true}// ./src/handlers/uploader.js
async function uploadDocuments(unattended=false,folderID=false){if(unattended){(0,storage.XO)("KYNOBY_UNATTENDED","true");(0,storage.XO)("KYNOBY_UNATTENDED_FOLDER",folderID)}if(!window.location.href.includes("DocumentViewer/Filing")){alert("You're on the wrong page!");return}let failedCount=parseInt((0,storage.bQ)("KYNOBY_FAILED_COUNT"))||0;let letter=unattended?document.querySelectorAll("ul#document_list > li > a")[failedCount]:document.querySelector("ul#document_list > li > a.active")||document.querySelector("ul#document_list > li > a");if(!letter){(0,storage.XO)("KYNOBY_UNATTENDED","false");(0,storage.XO)("KYNOBY_UNATTENDED_FOLDER","false");
// remove the processed letters from localStorage
localStorage.removeItem("processedLetters");alert("Automation exiting: No letters remaining");return}if(!letter.classList.contains("active")){(0,helpers.jM)(letter);await(0,helpers.cb)(3e3)}const guid=letter.getAttribute("data-guid");const steps=[
// "Get Verification Token",
"Fetch Letter Details","Get Letter Details"];const progressPane=(0,createMultiStepLoader.p)("Upload Letters",[letter],steps);await(0,helpers.cb)(2e3);// Wait for the page to load
progressPane.updateLetterTitleStates(letter);const result=(0,createResult.A)({guid,rvt:"",letter});const RPA_NOTE_FOLDERS=await JSON.parse((0,storage.bQ)("RPA_NOTE_FOLDERS"));const RequestVerificationToken=document.querySelector("input[name='__RequestVerificationToken']")?.value;if(!RequestVerificationToken){(0,storage.XO)("KYNOBY_UNATTENDED","false");(0,storage.XO)("KYNOBY_UNATTENDED_FOLDER","false");return}const nhs_id=await(0,docman.HK)(letter,RequestVerificationToken,result);const response=await fetchLetterDetails(guid,result,nhs_id,"Fetch Letter Details");
// }
// const response = await fetchLetterDetails(guid, result);
// alert("Response here: ", response);
if(!response){
// marking
progressPane.updateStep(letter,"Fetch Letter Details","fail");result.addRes("Fetch Letter Details","fail");progressPane.markLetterFailed(letter,result.build());
// setting
// setting
(0,storage.XO)("KYNOBY_FAILED_COUNT",failedCount+1);await(0,helpers.cb)(3e3);unattended?window.location.reload():alert("Automation exiting: Failed to fetch letter details");return}progressPane.updateStep(letter,"Fetch Letter Details","success");result.addRes("Fetch Letter Details","success");const LETTER_DETAILS=(0,storage.LU)();if(!LETTER_DETAILS){progressPane.updateStep(letter,"Get Letter Details","fail");result.addRes("Get Letter Details","fail");progressPane.markLetterFailed(letter,result.build());return}progressPane.updateStep(letter,"Get Letter Details","success");result.addRes("Get Letter Details","success").set("LETTER_DETAILS",LETTER_DETAILS);
// Exceptional Flow - if rpa note contains any of the keys in the object [action required, safeguarding, meds review], then rename & change folder, update rpa note & mark complete
const rpa_note=RPA_NOTE_FOLDERS.find((curr=>LETTER_DETAILS.rpa_note?.toLowerCase().includes(curr.rpa_notes.toLowerCase())));if(rpa_note&&rpa_note?.rpa_notes.length>0){["RPA Note Exists","Rename & Change Folder","Update RPA Note"].forEach((step=>progressPane.addStep(letter,step)));progressPane.updateStep(letter,"RPA Note Exists","success");result.addRes("RPA Note Exists","success").set("rpa_note_from_shary",rpa_note);const folderName=rpa_note.folder;try{await(0,utils_document.lF)(folderName);await(0,utils_document.nR)(folderName);progressPane.updateStep(letter,"Rename & Change Folder","success");result.addRes("Rename & Change Folder","success").set("folderName",folderName)}catch(e){progressPane.updateStep(letter,"Rename & Change Folder","fail");result.addRes("Rename & Change Folder","fail",`Rename & Change Folder to ${folderName}`).setError(e);progressPane.markLetterFailed(letter,result.build())}let procComplete=true;let rpaNote=LETTER_DETAILS?.rpa_note||"";const emisUpdated=(0,helpers.Zm)(LETTER_DETAILS,procComplete,rpaNote);const body={rpa_note:emisUpdated.rpaNote,proc_complete:emisUpdated.procComplete,locked:!emisUpdated.procComplete};result.set("body sent to Kynoby:",body);const accessToken=await(0,auth.i)(1);
// When the letter moved to required folder such as 'Review Required', we are going to mark the letter as complete in Kynoby as well
const mark_complete=await fetch(`${Constants.Vp[1].BASE_URL}/r2d2/gp_assist/${Constants.PI.INSTANCE_ID}/letter/${LETTER_DETAILS.letter_id}/mark_complete`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${accessToken}`},body:JSON.stringify(body)});if(!mark_complete.ok){progressPane.updateStep(letter,"Update RPA Note","fail");result.addRes("Update RPA Note","fail");progressPane.markLetterFailed(letter,result.build());(0,storage.XO)("KYNOBY_FAILED_COUNT",failedCount+1);await(0,helpers.cb)(2e3);unattended&&window.location.reload();return}progressPane.updateStep(letter,"Update RPA Note","success");result.addRes("Update RPA Note","success");
// .set("Mark Complete Response", await mark_complete.json());
progressPane.markLetterComplete(letter,result.build());await(0,helpers.cb)(2e3);unattended&&window.location.reload();return}
// else part if rpa doesn't contain any of the keys in the object
["Handover to File Document"].forEach((step=>progressPane.addStep(letter,step)));(0,storage.Jx)(LETTER_DETAILS);(0,storage.XO)("KYNOBY_IS_PROCESSING","true");(0,storage.XO)("KYNOBY_LETTER_GUID",guid);await(0,helpers.cb)(1e3);
// Delegate to next step (fileDocument)
progressPane.updateStep(letter,"Handover to File Document","success");result.addRes("Handover to File Document","success").set("upload documents",true);Constants.ai&&$("#action_file").click()}async function fileDocument(){
//todo: check if there's any way to extract letter using querySelector, so we can remove the global variable letter
const LETTER_DETAILS=await(0,storage.LU)();if(!LETTER_DETAILS){alert("No letter details found in the localStorage");return}const letterID=(0,storage.bQ)("documentId")||"";
// created custom letter mapping object to use in the createMultiStepLoader
const letter={nhsID:LETTER_DETAILS.nhs_id,guid:LETTER_DETAILS.letter_id,id:letterID};const steps=["Check Auto-Process",
// "Wait for GUID",
"Extract GUID","Match GUID"];const progressPane=(0,createMultiStepLoader.p)("File Document",[letter],steps);await(0,helpers.cb)(2e3);// Wait for the page to load
progressPane.updateLetterTitleStates(letter);const result=(0,createResult.A)({guid:LETTER_DETAILS.letter_id,rvt:"",letter});const CUSTOM_LETTER_MAPPING=await JSON.parse((0,storage.bQ)("CUSTOM_LETTER_MAPPING"));const isProcessing=(0,storage.bQ)("KYNOBY_IS_PROCESSING");if(!isProcessing||isProcessing.toString()!=="true"){progressPane.updateStep(letter,"Check Auto-Process","fail");result.addRes("Check Auto-Process","fail").set("KYNOBY_IS_PROCESSING",isProcessing);progressPane.markLetterFailed(letter,result.build());return}progressPane.updateStep(letter,"Check Auto-Process","success");result.addRes("Check Auto-Process","success");let needSelecting=false;try{await(0,helpers.aB)("#VaultGuid")}catch{if(!documentUrl){
// progressPane.updateStep(letter, "Wait for GUID", "fail");
// result.addRes("Wait for GUID", "fail").setError(e);
// progressPane.markLetterFailed(letter, result.build());
alert("Automation exiting: Could not find letter guid.");return}needSelecting=true}const guid=document.querySelector("#VaultGuid")?.value||documentUrl.match(/\/([^\/]+)\.TIF$/i)[1];
// const guid = document.querySelector("#VaultGuid")?.value;
if(!guid){progressPane.updateStep(letter,"Extract GUID","fail");result.addRes("Extract GUID","fail");progressPane.markLetterFailed(letter,result.build());return}progressPane.updateStep(letter,"Extract GUID","success");result.addRes("Extract GUID","success").set("guid",guid);const localGuid=(0,storage.bQ)("KYNOBY_LETTER_GUID");if(guid!==localGuid){progressPane.updateStep(letter,"Match GUID","fail");result.addRes("Match GUID","fail");progressPane.markLetterFailed(letter,result.build());return}progressPane.updateStep(letter,"Match GUID","success");result.addRes("Match GUID","success");
// Navigate to Letter (if required)
if(needSelecting){progressPane.addStep(letter,"Navigate to Letter (if required)");document.querySelector("#searchText").value=LETTER_DETAILS.nhs_id;await(0,helpers.cb)(1e3);$("#SearchSubmit").click();await(0,helpers.cb)(1e3);const hasDocLink=document.querySelector("a.has_documents");if(!hasDocLink){progressPane.updateStep(letter,"Navigate to Letter (if required)","fail");result.addRes("Navigate to Letter (if required)","fail");throw new Error("No 'has_documents' link found")}hasDocLink.click();progressPane.updateStep(letter,"Navigate to Letter (if required)","success");result.addRes("Navigate to Letter (if required)","success");return}let mapping=CUSTOM_LETTER_MAPPING.find((curr=>LETTER_DETAILS.letter_type&&curr.letter_type_from.toLowerCase().trim()===LETTER_DETAILS.letter_type.toLowerCase().trim()));if(mapping){progressPane.addStep(letter,"Check Custom Mapping");$("#FolderName_Popout").click();await(0,helpers.cb)(2e3);const folderNameValue=mapping.docman_folder?.trim();if(folderNameValue?.length>0){const folderElement=document.querySelector(`a[data-name='${folderNameValue}']`);if(!folderElement){progressPane.updateStep(letter,"Check Custom Mapping","fail");result.addRes("Check Custom Mapping","fail").set("Folder",folderNameValue??"N/A");progressPane.markLetterFailed(letter,result.build());alert(`Automation exiting: Docman Folder ${folderNameValue??"N/A"} not found. Please update the custom letter mappings`);return}(0,helpers.jM)(folderElement);await(0,helpers.cb)(2e3);progressPane.updateStep(letter,"Check Custom Mapping","success");result.addRes("Check Custom Mapping","success")}}
// Check RPA Note
const rpaNote=LETTER_DETAILS.rpa_note;if(rpaNote){const note=rpaNote.toLowerCase().trim();const exitReasons=["safeguarding","action required","deceased","deducted"];const match=exitReasons.find((reason=>note.includes(reason.toLowerCase().trim())));if(match){progressPane.addStep(letter,"Check RPA Note");await(0,helpers.cb)(1e3);progressPane.updateStep(letter,"Check RPA Note","success");result.addRes("Check RPA Note","success").set("rpaNote in Filing",match);progressPane.markLetterComplete(letter,result.build());alert(`One of the terms in RPA note matched: ${match.charAt(0).toUpperCase()+match.slice(1)}`);return}}["Input the Letter Details","Choose 'No Review required' Option","Handover to AddCodes"].forEach((step=>progressPane.addStep(letter,step)));const newEventDate=LETTER_DETAILS.incident_date.replace(/-/g,"/")||LETTER_DETAILS.letter_date.replace(/-/g,"/");let newLetterType=LETTER_DETAILS.letter_type;mapping&&mapping.letter_type_to!==""&&(newLetterType=mapping.letter_type_to);const newHospitalName=LETTER_DETAILS.hospital_name;let newDepartmentName=LETTER_DETAILS.department;mapping&&mapping.department!==""&&(newDepartmentName=mapping.department);const newNotes=`K-ID: ${LETTER_DETAILS.letter_id}`;const fields={"input#EventDate":newEventDate,"input#Df0":newLetterType,"input#Df1":newHospitalName,"input#Df2":newDepartmentName,"textarea#Notes":newNotes};for(const[selector,value]of Object.entries(fields)){const el=document.querySelector(selector);el&&(0,helpers.m$)(el,value)}progressPane.updateStep(letter,"Input the Letter Details","success");result.addRes("Input the Letter Details","success").set("Input fields",fields);$("#SummariseAfterFiling").click();(0,storage.XO)("KYNOBY_IS_PROCESSING","false");await(0,helpers.cb)(6e3);(0,utils_document.Ap)("kynoby");const optionsEl=document.querySelector("#WorkflowTemplateId");const options=Array.from(optionsEl.options);options.forEach((option=>{if(option.innerHTML.includes("No Review required")){option.selected=true;optionsEl.dispatchEvent(new Event("change",{bubbles:true}))}}));progressPane.updateStep(letter,"Choose 'No Review required' Option","success");result.addRes("Choose 'No Review required' Option","success").set("Available Options",options);const clearbtn=document.querySelector("#code-clearselected");(0,helpers.jM)(clearbtn);await(0,helpers.cb)(1e3);
//handover to the addCodes
progressPane.updateStep(letter,"Handover to AddCodes","success");result.addRes("Handover to AddCodes","success").set("fileDocument",true);Constants.ai&&$("#file_document").click()}async function addCodes(){if(!window.location.href.includes("TasksViewer/Tasks")&&!window.location.href.includes("TasksViewer/ShowProcessTask")){
// Check if you are on the correct URL
alert("You're in the wrong URL");return}
// unique identifier of each letter
let guid=(0,storage.bQ)("KYNOBY_LETTER_GUID");
// creating/getting of html element
let task=document.querySelector("#tasks_list > li.active");if(window.location.href.includes("TasksViewer/ShowProcessTask"));else{if(!task){alert("No task selected");return}{const taskId=task.getAttribute("data-id");const sourceId=task.getAttribute("data-source-id");const sourceType=task.getAttribute("data-source-type");const _=Date.now().toString();
// Used to open the letter such as we do click 
const url=Constants.PI.DOCMAN_URL+`/TasksViewer/GetActiveTaskModel?taskId=${taskId}&sourceId=${sourceId}&sourceType=${sourceType}&_=${_}`;const response=await fetch(url,{headers:{"x-requested-with":"XMLHttpRequest"},method:"GET"}).then((async res=>await res.json())).catch((err=>console.log(`Error fetching /GetActiveTaskModel: ${JSON.stringify(err)}`)));if(!response?.Result||!response?.Message){alert("Failed to fetch task");return}guid=JSON.parse(response.Message)?.VaultGuid}}const rvt=document.querySelector("input[name='__RequestVerificationToken']")?.value;if(!guid||!rvt){alert("Failed to fetch guid or rvt");return}
// setting this for the progress pane
task?task.setAttribute("data-guid",guid):task={guid};const steps=["Get Letter Details","Get NHS ID","Process clinical codes","Update RPA Note"];const progressPane=(0,createMultiStepLoader.p)("Add Codes",[task],steps);await(0,helpers.cb)(2e3);// Wait for the page to load
progressPane.updateLetterTitleStates(task);const result=(0,createResult.A)({guid,rvt,letter:task});let LETTER_DETAILS=(0,storage.LU)();// []
if(!Object.keys(LETTER_DETAILS).length||guid!==(0,storage.bQ)("KYNOBY_LETTER_GUID")){(0,storage.XO)("KYNOBY_LETTER_GUID",guid);(0,storage.XO)("KYNOBY_REQUEST_VERIFICATION_TOKEN",rvt);const success=await fetchLetterDetails(guid,result,"Get Letter Details");if(!success){progressPane.updateStep(task,"Get Letter Details","fail");result.addRes("Get Letter Details","fail",`Response: ${JSON.stringify(success)}`);progressPane.markLetterFailed(task,result.build());return}LETTER_DETAILS=(0,storage.LU)()}progressPane.updateStep(task,"Get Letter Details","success");result.addRes("Get Letter Details","success");
// result.set("LETTER_DETAILS", LETTER_DETAILS);
const nhsID=await(0,docman.HK)(task,rvt,result,"Get NHS ID");if(!nhsID){progressPane.updateStep(task,"Get NHS ID","fail");result.addRes("Get NHS ID","fail");progressPane.markLetterFailed(task,result.build());return}progressPane.updateStep(task,"Get NHS ID","success");result.addRes("Get NHS ID","success").set("nhsID",nhsID);const success=await processClinicalCodes({LETTER_DETAILS,nhsID,progressPane,task,result});if(!success){(0,storage.XO)("KYNOBY_LETTER_DETAILS","{}");progressPane.updateStep(task,"Process clinical codes","fail");result.addRes("Process clinical codes","fail");progressPane.markLetterFailed(task,result.build());return}
// alert(`Clinical codes processed for NHS ID: ${nhsID} and its response is ${success}`);
const rpaNote=LETTER_DETAILS?.rpa_note||"";const emisUpdated=(0,helpers.Zm)(LETTER_DETAILS,true,rpaNote);let body={};body=Constants.PI.MARK_LETTER_COMPLETE?{proc_complete:true,locked:true}:{rpa_note:emisUpdated.rpaNote,proc_complete:emisUpdated.procComplete,locked:!emisUpdated.procComplete};
// alert(
//   `${body}`
// );
// const body = {
//   rpa_note: emisUpdated.rpaNote,
//   proc_complete: emisUpdated.procComplete,
//   locked: !emisUpdated.procComplete,
// };
result.set("Mark Letter Complete:",Constants.PI.MARK_LETTER_COMPLETE);result.set("body sent to Kynoby:",body);const accessToken=await(0,auth.i)(1);// Refresh token if needed
try{const res=await fetch(`${Constants.Vp[1].BASE_URL}/r2d2/gp_assist/${Constants.PI.INSTANCE_ID}/letter/${LETTER_DETAILS.letter_id}/mark_complete`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${accessToken}`},body:JSON.stringify(body)});if(!res.ok)throw new Error(`HTTP ${res.status}`);progressPane.updateStep(task,"Update RPA Note","success");result.addRes("Update RPA Note","success")}catch(err){(0,storage.XO)("KYNOBY_LETTER_DETAILS","{}");progressPane.updateStep(task,"Update RPA Note","fail");result.addRes("Update RPA Note","fail").setError(err);progressPane.markLetterFailed(task,result.build());return}(0,storage.XO)("KYNOBY_LETTER_DETAILS","{}");const unattended=(0,storage.bQ)("KYNOBY_UNATTENDED")=="true";if(unattended){progressPane.addStep(task,"Click Finish");Constants.ai&&(0,helpers.jM)(document.querySelector("#activity_finish"));progressPane.updateStep(task,"Click Finish","success");result.addRes("Click Finish","success")}else alert(`All activities complete. Click Finish when happy. (NHS ID is ${nhsID})`);
// Now merge everything
progressPane.markLetterComplete(task,result.build())}},388:(__webpack_module__,__unused_webpack___webpack_exports__,__webpack_require__)=>{__webpack_require__.a(__webpack_module__,(async(__webpack_handle_async_dependencies__,__webpack_async_result__)=>{try{
/* harmony import */var _handlers_autoPickup_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(644);
/* harmony import */var _handlers_extractor_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(615);
/* harmony import */var _handlers_uploader_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(60);
/* harmony import */var _handlers_autoMove_js__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__(176);
/* harmony import */var _toolbar_createToolbar_js__WEBPACK_IMPORTED_MODULE_8__=__webpack_require__(10);
/* harmony import */var _utils_storage_js__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__(566);
/* harmony import */var _utils_helpers_js__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__(854);
/* harmony import */var _handlers_fetch_from_backend_js__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__(301);
/* harmony import */var _toolbar_createOnboardingForm_js__WEBPACK_IMPORTED_MODULE_7__=__webpack_require__(878);GM_registerMenuCommand("Kill Unattended",(()=>{(0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_4__.XO)("KYNOBY_UNATTENDED","false");(0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_4__.XO)("KYNOBY_UNATTENDED_FOLDER","false")}));(0,_utils_helpers_js__WEBPACK_IMPORTED_MODULE_5__.Iv)();
// Run on load
let client_Id=(0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_4__.bQ)("Inst_Id")||false;if(client_Id){
// create a form for user inputs
const shary_res=await(0,_handlers_fetch_from_backend_js__WEBPACK_IMPORTED_MODULE_6__.$J)();shary_res||alert(`There might be a problem with these backends: ${shary_res}`)}else(0,_toolbar_createOnboardingForm_js__WEBPACK_IMPORTED_MODULE_7__.A)();await(0,_utils_helpers_js__WEBPACK_IMPORTED_MODULE_5__.FE)();(0,_toolbar_createToolbar_js__WEBPACK_IMPORTED_MODULE_8__.Q)();(0,_handlers_autoPickup_js__WEBPACK_IMPORTED_MODULE_0__.K)();
// click handlers for toolbar
$("#extractXfromSelected").on("click",(()=>(0,_handlers_extractor_js__WEBPACK_IMPORTED_MODULE_1__.W)(true)));$("#uploadSingle").on("click",(()=>{(0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_4__.XO)("KYNOBY_FAILED_COUNT",0);(0,_handlers_uploader_js__WEBPACK_IMPORTED_MODULE_2__.ge)()}));$("#uploadAll").on("click",(()=>{(0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_4__.XO)("KYNOBY_FAILED_COUNT",0);(0,_handlers_uploader_js__WEBPACK_IMPORTED_MODULE_2__.ge)(true,document.querySelector("#folders_list a.active").getAttribute("data-id"))}));$("#addCodes").on("click",(()=>(0,_handlers_uploader_js__WEBPACK_IMPORTED_MODULE_2__.Eo)()));$("#moveLetters").on("click",(()=>(0,_handlers_autoMove_js__WEBPACK_IMPORTED_MODULE_3__.p)()));$("#clearLocalStorage").on("click",(()=>{(0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_4__.N1)()}));$("#changeClient").on("click",(()=>(0,_toolbar_createOnboardingForm_js__WEBPACK_IMPORTED_MODULE_7__.A)()));__webpack_async_result__()}catch(e){__webpack_async_result__(e)}}),1)},529:(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{
/* harmony export */__webpack_require__.d(__webpack_exports__,{
/* harmony export */p:()=>/* binding */perLetterProgressPane});
/* harmony import */var _global_Constants_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(824);
/* harmony import */var _utils_helpers_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(854);function perLetterProgressPane(id,letters,stepsPerLetter=[]){id=id.split(" ").map((word=>word.charAt(0).toUpperCase()+word.slice(1))).join(" ");
// const containerId = `progress-${id}`;
const containerId=`progress-container`;let container=document.getElementById(containerId);
// const closeButtonId = `close-progress-pane-${id}`;
const closeButtonId=`close-progress-pane`;if(!container){container=document.createElement("div");container.id=containerId;container.style.cssText=`
      position: fixed;
      bottom: 0;
      right: 0;
      width: 280px;
      max-height: 450px;
      overflow: auto;
      background: #1d3557;
      border-radius: 4px;
      padding-bottom: 16px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
    `;document.body.appendChild(container)}container.innerHTML=`
    <div style="
      position: sticky;
      top: 0;
      left: 0;
      background: rgba(255, 255, 255, 0.1); /* semi-transparent white */
      backdrop-filter: blur(15px); /* blur background behind */
      -webkit-backdrop-filter: blur(15px); /* Safari support */
      display: flex;
      padding: 0 12px;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      z-index: 99;
      border-radius: 0 0 12px 12px; /* rounded corners */
      color: #f1faee;
      min-height: 50px;
      width: 100%;
    ">

      <h4 style="margin: 0; font-weight: 600;font-size: 15px; letter-spacing: 2px;">
        ${_global_Constants_js__WEBPACK_IMPORTED_MODULE_0__.PI.Client_Name||"Choose Client"}
      </h4>
      <button id="${closeButtonId}" style="
        background: none;
        border: 1px solid #eee;
        border-radius: 2px;
        font-size: 16px;
        cursor: pointer;
        color: #f1faee;
        transition: color 0.2s ease;
      " title="Close">✖</button>
    </div>
  `;document.getElementById(closeButtonId)?.addEventListener("click",(()=>container.remove()));const letterBlocks=[];letters.forEach((currLetter=>{const isDOM=(0,_utils_helpers_js__WEBPACK_IMPORTED_MODULE_1__.Fe)(currLetter);const nhsID=isDOM?currLetter?.querySelector("strong.nhs")?.textContent.replace(/ /g,"")||null:currLetter.nhsID;const letter_guid=isDOM?currLetter.getAttribute("data-guid"):currLetter.guid;const letter_id=isDOM?currLetter.getAttribute("data-id"):currLetter.id;if(!letter_guid&&!letter_id&&!nhsID)throw new Error("Letter must contain either guid, id, or nhsId.");const letterBlock=document.createElement("div");letterBlock.classList.add("letter-block");letter_guid&&letterBlock.setAttribute("data-letter-guid",letter_guid);letter_id&&letterBlock.setAttribute("data-letter-id",letter_id);nhsID&&letterBlock.setAttribute("data-nhs-id",nhsID);letterBlock.style.cssText=`
      margin-bottom: 14px;
      transition: background 0.3s ease;
      color: #f1faee;
    `;const letterText=`<span data-letter-text>${nhsID?`NHS ID: ${nhsID}`:letter_guid?`GUID: ${letter_guid}`:`ID: ${letter_id}`}</span>`;const stepsHtml=stepsPerLetter.map((step=>`
      <li data-step="${step}" style="opacity: 0.85; padding: 2px 0; transition: opacity 0.2s ease;">
        <span class="step-icon" style="display: inline-block; margin-right: 4px;"></span>
        <span class="step-title">${step}</span>
      </li>
    `)).join("");letterBlock.innerHTML=`
      <div data-letter-title style="
        font-weight: 500;
        padding: 12px 8px;
        margin-bottom: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
      ">
        <span data-toggle-arrow style="transition: transform 0.2s ease; font-size: 14px; display: inline-block;">⮞</span>
        <span data-letter-icon></span>
        ${letterText}
      </div>
      <ul style="list-style: none; padding: 6px 0px 10px 16px; display: none;">
        ${stepsHtml}
      </ul>
    `;const title=letterBlock.querySelector("[data-letter-title]");const letterTextElement=letterBlock.querySelector("[data-letter-text]");const stepsList=letterBlock.querySelector("ul");const toggleArrow=letterBlock.querySelector("[data-toggle-arrow]");title.addEventListener("click",(()=>{const isVisible=stepsList.style.display==="block";letterBlocks.forEach((block=>{const ul=block.querySelector("ul");const arrow=block.querySelector("[data-toggle-arrow]");if(ul&&ul!==stepsList){ul.style.display="none";arrow.style.transform="rotate(0deg)"}}));stepsList.style.display=isVisible?"none":"block";toggleArrow.style.transform=isVisible?"rotate(0deg)":"rotate(90deg)";
// Copy full title text to clipboard
const fullTitle=letterTextElement.textContent.trim();navigator.clipboard.writeText(fullTitle).then((()=>{console.log(`Copied to clipboard: ${fullTitle}`)})).catch((err=>{console.error("Failed to copy to clipboard",err)}))}));container.appendChild(letterBlock);letterBlocks.push(letterBlock)}));function getLetterBlock(letterEl){const isDOM=(0,_utils_helpers_js__WEBPACK_IMPORTED_MODULE_1__.Fe)(letterEl);
// Extract identifiers
const nhsID=isDOM?letterEl?.querySelector("strong.nhs")?.textContent.replace(/ /g,"")||null:letterEl.nhsID;const guid=isDOM?letterEl.getAttribute("data-guid"):letterEl.guid;const id=isDOM?letterEl.getAttribute("data-id"):letterEl.id;if(!nhsID&&!guid&&!id)throw new Error("Letter must have nhsID, guid, or id.");return letterBlocks.find((block=>nhsID&&block.getAttribute("data-nhs-id")===nhsID||guid&&block.getAttribute("data-letter-guid")===guid||id&&block.getAttribute("data-letter-id")===id))}function addStep(letterEl,stepName){const letter=getLetterBlock(letterEl);const ul=letter?.querySelector("ul");if(!ul||[...ul.children].some((li=>li.getAttribute("data-step")===stepName)))return;const li=document.createElement("li");li.setAttribute("data-step",stepName);li.style.cssText="opacity: 0.85; padding: 2px 0 4px; margin-bottom: 4px; transition: opacity 0.2s ease;";li.innerHTML=`
      <span class="step-icon" style="display: inline-block; margin-right: 4px;"></span>
      <span class="step-title">${stepName}</span>
    `;ul.appendChild(li)}
//todo we can integrate createResult with this function
function updateStep(letterEl,stepName,status){const stepLi=[...getLetterBlock(letterEl)?.querySelectorAll("li")||[]].find((li=>li.getAttribute("data-step")?.toLowerCase()===stepName.toLowerCase()));if(!stepLi)throw new Error(`Step "${stepName}" not found in updateStep for letter: ${letterEl.outerHTML}`);stepLi.querySelector(".step-icon").textContent=status==="success"?"✔️":"❌"}function addSubStep(letterEl,stepName,subStepName){const letter=getLetterBlock(letterEl);if(!letter)throw new Error("Letter not found in addSubStep");const stepLi=[...letter.querySelectorAll("li")].find((li=>li.getAttribute("data-step")?.toLowerCase().trim()===stepName.toLowerCase().trim()));if(!stepLi)throw new Error(`Step "${stepName}" not found in addSubStep`);let substepList=stepLi.querySelector("ul.substep-list");if(!substepList){substepList=document.createElement("ul");substepList.classList.add("substep-list");substepList.style.cssText=`
      list-style: none;
      padding-left: 8px;
      margin: 8px 0 0 0;
      display: block;
      transition: max-height 0.3s ease-out;  
      border-radius: 4px;
      color: #f1faee;
    `;stepLi.appendChild(substepList)}const exists=[...substepList.children].some((li=>li.getAttribute("data-substep")?.toLowerCase().trim()===subStepName.toLowerCase().trim()));if(exists)return;const subLi=document.createElement("li");subLi.setAttribute("data-substep",subStepName);subLi.style.cssText="opacity: 0.9; padding: 2px 0;";subLi.innerHTML=`
    <span class="substep-icon" style="display: inline-block; margin-right: 4px;"></span>
    <span class="substep-title">${subStepName}</span>
  `;substepList.appendChild(subLi)}function updateSubStep(letterEl,stepName,subStepName,status){const letter=getLetterBlock(letterEl);if(!letter)throw new Error("Letter not found in updateSubStep");const stepLi=[...letter.querySelectorAll("li")].find((li=>li.getAttribute("data-step")?.toLowerCase().trim()===stepName.toLowerCase().trim()));const substepLi=stepLi?.querySelector(`li[data-substep="${subStepName}"]`);if(!substepLi){console.log("Substep not found in updateSubStep");return}substepLi.scrollIntoView({behavior:"smooth",block:"center"});const icon=substepLi.querySelector(".substep-icon");if(status==="success")icon.textContent="✅";else if(status==="fail"){icon.textContent="❌";updateStep(letterEl,stepName,"fail")}}
// function updateLetterProgressBar(letterEl) {
//   const block = getLetterBlock(letterEl);
//   const steps = [...(block?.querySelectorAll("li") || [])];
//   const completed = steps.filter(
//     (li) => li.querySelector(".step-icon")?.textContent === "✔️"
//   ).length;
//   const percent = steps.length ? (completed / steps.length) * 100 : 0;
//   const fill = block?.querySelector(".letter-progress-fill");
//   if (fill) fill.style.width = `${percent}%`;
// }
function applyGlasmorphicStyle(element){element.style.background="rgba(255, 255, 255, 0.1)";element.style.backdropFilter="blur(10px)";element.style.webkitBackdropFilter="blur(10px)";element.style.borderRadius="5px"}function applyDefaultStyle(element){element.style.background="transparent";element.style.backdropFilter="none";element.style.webkitBackdropFilter="none";element.style.borderRadius="5px"}function applyFailureStyle(element){element.style.background="rgba(230, 57, 70,0.45)";element.style.backdropFilter="none";element.style.webkitBackdropFilter="none";element.style.borderRadius="0px"}function updateLetterTitleStates(letterEl){const block=getLetterBlock(letterEl);if(!block)throw new Error(`Letter not found in updateLetterTitleStates`);const steps=block?.querySelector("ul");const toggleArrow=block?.querySelector("[data-toggle-arrow]");const toggleIcon=block?.querySelector("[data-letter-icon]");steps&&(steps.style.display="block");toggleArrow&&(toggleArrow.style.transform="rotate(90deg)");toggleIcon&&(toggleIcon.textContent="⌛");block.scrollIntoView({behavior:"smooth",block:"center"});applyGlasmorphicStyle(block)}function markLetterStatus(letterEl,iconSymbol,letterStyling,statusLabel,res){const block=getLetterBlock(letterEl);if(!block)throw new Error("Letter block not found for marking status");const title=block.querySelector("[data-letter-title]");const icon=title?.querySelector("[data-letter-icon]");const steps=block.querySelector("ul");const toggleArrow=title?.querySelector("[data-toggle-arrow]");if(icon){icon.textContent=iconSymbol;icon.style.opacity=1}toggleArrow&&(toggleArrow.style.transform="rotate(0deg)");steps?.style.display==="block"&&(steps.style.display="none");letterStyling(block);processAndStoreResult(res,statusLabel,id);const isLastLetter=block===letterBlocks[letterBlocks.length-1];isLastLetter&&downloadLettersResponse()}function processAndStoreResult(res,statusLabel,id){const allLetters=JSON.parse(localStorage.getItem("processedLetters"))||[];const resultDetails={...res,status:`${statusLabel} ${id}`};
// Find index by GUID or NHS ID
const existingIndex=allLetters.findIndex((curr=>res.guid&&curr.guid===res.guid||res.nhsID&&curr.nhsID===res.nhsID));if(existingIndex!==-1){const existingLetter=allLetters[existingIndex];
// Update all non-response properties
Object.keys(resultDetails).forEach((key=>{key!=="response"&&key!=="currentResponse"&&(existingLetter[key]=resultDetails[key])}));
// Check if the current response already exists
const isDuplicate=existingLetter.response.some((entry=>(0,_utils_helpers_js__WEBPACK_IMPORTED_MODULE_1__.bD)(entry.data,resultDetails.currentResponse)));!isDuplicate&&resultDetails.currentResponse&&existingLetter.response.push({status:resultDetails.status,data:resultDetails.currentResponse});delete existingLetter.currentResponse}else{resultDetails.response=resultDetails.currentResponse?[{status:resultDetails.status,data:resultDetails.currentResponse}]:[];delete resultDetails.currentResponse;allLetters.push(resultDetails)}localStorage.setItem("processedLetters",JSON.stringify(allLetters))}function downloadLettersResponse(){const allLetters=JSON.parse(localStorage.getItem("processedLetters"))||[];
//todo: Filter only the failed letters
const failedLetters=allLetters.filter((letter=>letter.status.toLowerCase().trim().includes("failed")));
//todo: If no failed letters, show a message and return
if(failedLetters.length===0)return;{const content=failedLetters.map((letter=>`GUID: ${letter.guid}
`+`NHS ID: ${letter.nhsID||""}
`+`RVT: ${letter.rvt||""}
`+`failedAt: ${letter.failedAt||""}
`+`Error: ${letter.error||""}
`+`Status: ${letter.status}
`+`Time: ${letter.timeAt}
`+`Response: ${JSON.stringify(letter.response,null,2)}
`+`--------------------------------------------
`)).join("");const file=new Blob([content],{type:"text/plain;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(file);const fileName=`processedLetters-${(new Date).toLocaleString()}.txt`;a.download=fileName;a.click();
// after successful download, clear the localStorage
localStorage.removeItem("processedLetters")}}return{addStep,updateStep,markLetterComplete:(el,res)=>markLetterStatus(el,"✅",applyDefaultStyle,"Completed",res),markLetterFailed:(el,res)=>markLetterStatus(el,"❌",applyFailureStyle,"Failed",res),markLetterSkip:(el,res)=>markLetterStatus(el,"♂️",applyDefaultStyle,"Skipped",res),updateLetterTitleStates,downloadLettersResponse,updateSubStep,addSubStep}}},878:(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{
/* harmony export */__webpack_require__.d(__webpack_exports__,{
/* harmony export */A:()=>/* binding */createCustomForm});
/* harmony import */var _utils_storage_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(566);function createCustomForm(){const overlay=document.createElement("div");overlay.style.position="fixed";overlay.style.top="0";overlay.style.left="0";overlay.style.width="100%";overlay.style.height="100%";overlay.style.background="rgba(0,0,0,0.5)";overlay.style.display="flex";overlay.style.justifyContent="center";overlay.style.alignItems="center";overlay.style.zIndex="9999";const formContainer=document.createElement("div");formContainer.className="custom_form";formContainer.style.cssText=`
        background: #fff;
        padding: 20px 30px;
        border-radius: 4px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        font-family: Arial, sans-serif;
        text-align: center;
        min-width: 360px;
      `;const heading=document.createElement("h1");heading.textContent="Select Client";heading.style.marginBottom="20px";formContainer.appendChild(heading);const dropdownWrapper=document.createElement("div");dropdownWrapper.style.marginBottom="15px";const dropdown=document.createElement("select");dropdown.style.cssText=`
        width: 100%;
        padding: 10px;
        border-radius: 4px;
        border: 2px solid #adadadff;
      `;const options=[{Optionlabel:"",OptionValue:""},{Optionlabel:"Spring Hourse Surgery",OptionValue:"shs_0001"},{Optionlabel:"SSP Bolton",OptionValue:"BMC_001"}];options.forEach(((elem,idx)=>{const opt=document.createElement("option");if(idx===0){opt.value="";opt.textContent="Select an option";opt.disabled=true}else{opt.value=elem.OptionValue;opt.textContent=elem.Optionlabel}dropdown.appendChild(opt)}));dropdownWrapper.appendChild(dropdown);
// Button wrapper
const buttonWrapper=document.createElement("div");const submitBtn=document.createElement("button");submitBtn.textContent="Submit";submitBtn.style.cssText=`
        width: 100%;
        padding: 12px;
        background: #1d3557;
        border: none;
        border-radius: 4px;
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: transform 0.2s;
      `;
// submitBtn.onclick = () => (submitBtn.style.transform = "scale(0.98)");
buttonWrapper.appendChild(submitBtn);
// Build form
formContainer.appendChild(dropdownWrapper);formContainer.appendChild(buttonWrapper);overlay.appendChild(formContainer);document.body.appendChild(overlay);
// Submit logic
// submitBtn.addEventListener("click", () => {
//   const selectedValue = dropdown.value;
//   if (!selectedValue) {
//     alert("Please select an option!");
//     return;
//   }
//   setData("Inst_Id", selectedValue);
//   document.body.removeChild(overlay);
//   clearStorage();
// });
// Combine both behaviors into a single event listener
submitBtn.addEventListener("click",(()=>{submitBtn.style.transform="scale(0.98)";
// Add a slight delay to allow the transform to be visible before removing the form
setTimeout((()=>{const selectedValue=dropdown.value;if(!selectedValue){alert("Please select an option!");return}const selectedLabel=dropdown.options[dropdown.selectedIndex].textContent;(0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_0__.XO)("Inst_Id",selectedValue);(0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_0__.XO)("Client_name",selectedLabel);document.body.removeChild(overlay);(0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_0__.N1)()}),200)}))}},144:(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{
/* harmony export */__webpack_require__.d(__webpack_exports__,{
/* harmony export */A:()=>/* binding */createResult});function createResult({guid="",rvt=""}){let currentResponse={};let status="success";let failedAt="";let error="";const rootFields={guid,rvt};return{addRes(step,result,detail=null){if(result==="fail"){status="fail";failedAt=step}const existing=currentResponse[step];existing&&typeof existing==="object"&&existing.subSteps?currentResponse[step]={...existing,summary:detail||`${step}: ${result}`}:currentResponse[step]=detail||`${step}: ${result}`;return this},addSubRes(step,subStep,message){currentResponse[step]||(currentResponse[step]={subSteps:{}});const subSteps=currentResponse[step].subSteps;subSteps[subStep]?subSteps[subStep]=[].concat(subSteps[subStep],message):subSteps[subStep]=message;return this},setSkip(reason={}){status="skip";Object.assign(currentResponse,reason);return this},setError(err){error=typeof err==="string"?err:err?.message||JSON.stringify(err);return this},set(key,value=""){rootFields[key]=value;return this},build(){return{status,failedAt,currentResponse,error,...rootFields,timeAt:(new Date).toISOString()}}}}},10:(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{
/* harmony export */__webpack_require__.d(__webpack_exports__,{
/* harmony export */Q:()=>/* binding */createToolbar});function createToolbar(){const toolbarButtons=document.createElement("div");toolbarButtons.className="toolbar_buttons";toolbarButtons.style.cssText="margin-left: 2%; border: 1px gold solid;";toolbarButtons.id="my_buttons";toolbarButtons.innerHTML=`
        <div style="display: inline-block">
            <a class="info" id="extractXfromSelected">
                <div class="information"><i class="la la-file-export"></i></div>
                <div>Extract from Selected</div>
            </a>
        </div>
        <div style="display: inline-block">
            <a class="info" id="uploadSingle">
                <div class="information"><i class="la la-file-upload"></i></div>
                <div>Upload 1</div>
            </a>
        </div>
        <div style="display: inline-block">
            <a class="info" id="uploadAll">
                <div class="information"><i class="la la-file-upload"></i></div>
                <div>Upload All (TODO)</div>
            </a>
        </div>
        <div style="display: inline-block">
            <a class="info" id="addCodes">
                <div class="information"><i class="lab la-codepen"></i></div>
                <div>Add Codes</div>
            </a>
        </div>
        <div style="display: inline-block">
            <a class="info" id="moveLetters">
                <div class="information"><i class="las la-people-carry"></i></div>
                <div>Auto-Move Letters</div>
            </a>
        </div>
        <div style="display: inline-block">
            <a class="info" id="clearLocalStorage">
                <div class="information"><i class="las la-trash-alt"></i></div>
                <div>Clear Local Storage</div>
            </a>
        </div>
        <div style="display: inline-block">
            <a class="info" id="changeClient">
                <div class="information"><i class="las la-user-alt"></i></div>
                <div>Change Client</div>
            </a>
        </div>
    `;const mainToolbar=document.querySelector("#main_toolbar");mainToolbar?mainToolbar.insertBefore(toolbarButtons,mainToolbar.children[2]):alert("Element #main_toolbar not found.")}},974:(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{
/* harmony export */__webpack_require__.d(__webpack_exports__,{
/* harmony export */Ap:()=>/* binding */addTag,
/* harmony export */lF:()=>/* binding */renameLetter,
/* harmony export */nR:()=>/* binding */changeFolder});
/* harmony import */var _helpers_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(854);async function renameLetter(newName){(0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.jM)(document.querySelector("#action_rename"),"actionRename");await(0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.cb)(1500);(0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.m$)(document.querySelector(".ajs-input"),newName);await(0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.cb)(1500);(0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.jM)(document.querySelector(".ajs-ok"),"actionOkBtn");await(0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.cb)(1500);return}async function changeFolder(newFolder){(0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.jM)(document.querySelector("#action_changefolder"),"actionChangeFolder");await(0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.cb)(1500);(0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.jM)(document.querySelector(`#folderselection a[data-name='${newFolder}']`),`actionFolderSelection ${newFolder}`);await(0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.cb)(1500);(0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.jM)(document.querySelector("#change_folder_confirm"),"actionConfirmFolderBtn");await(0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.cb)(1500);return}function addTag(tagName){const tagsBox=document.querySelector("ul.select2-choices");const newChoice=document.createElement("li");newChoice.classList.add("select2-search-choice");const newChoiceName=document.createElement("div");newChoiceName.textContent=tagName;const newChoiceUrl=document.createElement("a");newChoiceUrl.classList.add("select2-search-choice-close");newChoiceUrl.href="#";newChoiceUrl.setAttribute("tabIndex",-1);newChoice.appendChild(newChoiceName);newChoice.appendChild(newChoiceUrl);tagsBox.prepend(newChoice)}},854:(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{
/* harmony export */__webpack_require__.d(__webpack_exports__,{
/* harmony export */FE:()=>/* binding */watchForDesktopConnection,
/* harmony export */Fe:()=>/* binding */isDOMElement,
/* harmony export */Iv:()=>/* binding */checkURL,
/* harmony export */Yq:()=>/* binding */formatDate,
/* harmony export */Zm:()=>/* binding */checkEmisUpdateRequired,
/* harmony export */aB:()=>/* binding */waitForEl,
/* harmony export */bD:()=>/* binding */deepEqual,
/* harmony export */cb:()=>/* binding */delay,
/* harmony export */jM:()=>/* binding */click,
/* harmony export */kd:()=>/* binding */checkAndTriggerConversion,
/* harmony export */m$:()=>/* binding */changeValue});
/* unused harmony export abbreviateSurgeryName */
/* harmony import */var _global_Constants_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(824);function delay(ms){return new Promise((resolve=>setTimeout(resolve,ms)))}function click(element,elemName=""){if(!element)throw new Error(`Click Element not found ${element} and ${elemName}`);element.dispatchEvent(new Event("click",{bubbles:true}));
// console.log("Element clicked: ", element);
return}function formatDate(date){
// why does js not have an in built DD Mmm YYYY format
const days=["01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31"];const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];return`${days[date.getDate()-1]} ${months[date.getMonth()]} ${date.getFullYear()}`}function changeValue(el,newVal){if(!el)throw new Error(`Input Element not found: ${el} and value: ${newVal}`);el.value=newVal;el.setAttribute("value",newVal);el.dispatchEvent(new Event("keyup",{bubbles:true}))}function isDOMElement(el){return el instanceof Element||el instanceof DocumentFragment}function waitForEl(selector,timeout=5e3,delay=1e3,style=null){return new Promise(((resolve,reject)=>{const checkCondition=element=>{if(!element)return false;if(!style)return true;const[styleProperty,expectedValue]=style.split(":").map((s=>s.trim()));return window.getComputedStyle(element)[styleProperty]===expectedValue};const observer=new MutationObserver((()=>{const element=document.querySelector(selector);if(element&&checkCondition(element)){observer.disconnect();clearInterval(interval);setTimeout((()=>resolve(element)),delay)}}));observer.observe(document.body,{childList:true,subtree:true});const interval=setInterval((()=>{const element=document.querySelector(selector);if(element&&checkCondition(element)){observer.disconnect();clearInterval(interval);setTimeout((()=>resolve(element)),delay)}}),delay);setTimeout((()=>{observer.disconnect();clearInterval(interval);reject(new Error("Element not found or condition not met within timeout"))}),timeout)}))}function watchForDesktopConnection(){return new Promise(((resolve,reject)=>{const button=document.querySelector("#DesktopConnection");if(!button){console.warn("Desktop connection button not found in DOM.");resolve(true);// Can't enforce check if button is missing
return}const isVisible=()=>button.offsetParent!==null;
// Check immediately
if(isVisible()){alert("Please make sure Docman Desktop App and EMIS is running properly.");window.location.reload();// Reload the page
reject(false);// Stop app execution
return}
// Watch for it becoming visible later (disconnection)
const observer=new MutationObserver((()=>{if(isVisible()){alert("Please make sure Docman Desktop App and EMIS Web App is running properly.");
// window.location.reload(); // Reload the page
observer.disconnect();reject(false)}}));observer.observe(button,{attributes:true,attributeFilter:["style","class"]});resolve(true)}))}function checkAndTriggerConversion(timeout=1e4,result,step="Download Letter"){return new Promise((resolve=>{result?.addSubRes(step,"Check and Trigger Conversion","Starting conversion check.");const container=document.getElementById("document_view");if(!container){result?.addSubRes(step,"Check and Trigger Conversion","No document view found.");resolve(false);return}const expectedText="A conversion is required to allow Annotations on this document, click here to convert.";function isVisible(el){return!!el?.offsetParent}function handleWizard(wizardElement,observer){if(!wizardElement||!isVisible(wizardElement))return false;const normalizedText=wizardElement.textContent.trim().replace(/\s+/g," ").toLowerCase();if(normalizedText.includes(expectedText.toLowerCase())){
// alert("Visible conversion warning detected!");
const clickable=wizardElement.querySelector("u")||wizardElement.querySelector("a");if(clickable){clickable.click();result?.addSubRes(step,"Check and Trigger Conversion","Conversion triggered and link clicked.");const delay=5e3;observer.disconnect();setTimeout((()=>{resolve(true)}),delay);return true}result?.addSubRes(step,"Check and Trigger Conversion","Conversion warning found, but no clickable element.")}return false}const observer=new MutationObserver((()=>{const wizard=container.querySelector("#clinicalcode-wizard");wizard&&handleWizard(wizard,observer)}));observer.observe(container,{childList:true,subtree:true});
// Immediate check in case it's already there
const existing=container.querySelector("#clinicalcode-wizard");if(existing&&handleWizard(existing,observer))return;
// Timeout fallback
setTimeout((()=>{result?.addSubRes(step,"Check and Trigger Conversion","Timeout occurred while waiting for conversion.");observer.disconnect();resolve(false)}),timeout)}))}function checkEmisUpdateRequired(LETTER_DETAILS,procComplete=true,rpaNote){const isEmisUpdateRequired=_global_Constants_js__WEBPACK_IMPORTED_MODULE_0__.Sx.map((curr=>curr.trim().toLowerCase())).includes(LETTER_DETAILS.letter_type.trim().toLowerCase());if(isEmisUpdateRequired){procComplete=false;let note="DocMan Updated, EMIS Update Required";rpaNote=rpaNote?rpaNote.toLowerCase().trim().includes("DocMan Updated".toLowerCase().trim())?`${rpaNote}, EMIS Update Required`:`${rpaNote}, ${note}`:note}else{let note="DocMan Updated";rpaNote=rpaNote?rpaNote.toLowerCase().trim().includes("DocMan Updated".toLowerCase().trim())?rpaNote:`${rpaNote}, ${note}`:note}return{rpaNote,procComplete}}function deepEqual(obj1,obj2){if(typeof obj1!=="object"||typeof obj2!=="object"||obj1===null||obj2===null)return false;const keys1=Object.keys(obj1);const keys2=Object.keys(obj2);if(keys1.length!==keys2.length)return false;for(let key of keys1){if(!keys2.includes(key))return false;const val1=obj1[key];const val2=obj2[key];const bothAreObjects=typeof val1==="object"&&val1!==null&&typeof val2==="object"&&val2!==null;if(bothAreObjects&&!deepEqual(val1,val2))return false}return true}function checkURL(){const currentOrigin=window.location.origin;if(currentOrigin!==_global_Constants_js__WEBPACK_IMPORTED_MODULE_0__.PI.DOCMAN_URL){localStorage.setItem("KYNOBY_DOCMAN_URL",currentOrigin);console.log(`Docman URL changed to ${currentOrigin}, updating config.`)}}},566:(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{
/* harmony export */__webpack_require__.d(__webpack_exports__,{
/* harmony export */Jx:()=>/* binding */setLetterDetails,
/* harmony export */LU:()=>/* binding */getLetterDetails,
/* harmony export */N1:()=>/* binding */clearStorage,
/* harmony export */XO:()=>/* binding */setData,
/* harmony export */bQ:()=>/* binding */getData});
/* unused harmony export clearUserStorage */
function getData(key){return localStorage.getItem(key)}const setData=(key,value)=>{localStorage.setItem(key,value)};const setLetterDetails=details=>{LETTER_DETAILS=details;setData("KYNOBY_LETTER_DETAILS",JSON.stringify(LETTER_DETAILS))};const getLetterDetails=()=>{LETTER_DETAILS=JSON.parse(getData("KYNOBY_LETTER_DETAILS"))||{};return LETTER_DETAILS};const clearStorage=(keys=["RPA_NOTE_FOLDERS","STRINGS","CUSTOM_LETTER_MAPPING","processedLetters","KYNOBY_LETTER_DETAILS","KYNOBY_LETTER_GUID","KYNOBY_FAILED_COUNT","KYNOBY_IS_PROCESSING","KYNOBY_REQUEST_VERIFICATION_TOKEN","KYNOBY_UNATTENDED","KYNOBY_UNATTENDED_FOLDER","documentId","KYNOBY_DOCMAN_URL"])=>{if(!Array.isArray(keys)||keys.length===0)return;keys.forEach((key=>{localStorage.removeItem(key)}));window.location.reload()};let LETTER_DETAILS=JSON.parse(getData("KYNOBY_LETTER_DETAILS"))||{}}};
// The module cache
var __webpack_module_cache__={};
// The require function
function __webpack_require__(moduleId){
// Check if module is in cache
var cachedModule=__webpack_module_cache__[moduleId];if(cachedModule!==void 0)return cachedModule.exports;
// Create a new module (and put it into the cache)
var module=__webpack_module_cache__[moduleId]={
// no module.id needed
// no module.loaded needed
exports:{}};
// Execute the module function
__webpack_modules__[moduleId](module,module.exports,__webpack_require__);
// Return the exports of the module
return module.exports}
/* webpack/runtime/async module */
(()=>{var webpackQueues=typeof Symbol==="function"?Symbol("webpack queues"):"__webpack_queues__";var webpackExports=typeof Symbol==="function"?Symbol("webpack exports"):"__webpack_exports__";var webpackError=typeof Symbol==="function"?Symbol("webpack error"):"__webpack_error__";var resolveQueue=queue=>{if(queue&&queue.d<1){queue.d=1;queue.forEach((fn=>fn.r--));queue.forEach((fn=>fn.r--?fn.r++:fn()))}};var wrapDeps=deps=>deps.map((dep=>{if(dep!==null&&typeof dep==="object"){if(dep[webpackQueues])return dep;if(dep.then){var queue=[];queue.d=0;dep.then((r=>{obj[webpackExports]=r;resolveQueue(queue)}),(e=>{obj[webpackError]=e;resolveQueue(queue)}));var obj={};obj[webpackQueues]=fn=>fn(queue);return obj}}var ret={};ret[webpackQueues]=x=>{};ret[webpackExports]=dep;return ret}));__webpack_require__.a=(module,body,hasAwait)=>{var queue;hasAwait&&((queue=[]).d=-1);var depQueues=new Set;var exports=module.exports;var currentDeps;var outerResolve;var reject;var promise=new Promise(((resolve,rej)=>{reject=rej;outerResolve=resolve}));promise[webpackExports]=exports;promise[webpackQueues]=fn=>(queue&&fn(queue),depQueues.forEach(fn),promise["catch"]((x=>{})));module.exports=promise;body((deps=>{currentDeps=wrapDeps(deps);var fn;var getResult=()=>currentDeps.map((d=>{if(d[webpackError])throw d[webpackError];return d[webpackExports]}));var promise=new Promise((resolve=>{fn=()=>resolve(getResult);fn.r=0;var fnQueue=q=>q!==queue&&!depQueues.has(q)&&(depQueues.add(q),q&&!q.d&&(fn.r++,q.push(fn)));currentDeps.map((dep=>dep[webpackQueues](fnQueue)))}));return fn.r?promise:getResult()}),(err=>(err?reject(promise[webpackError]=err):outerResolve(exports),resolveQueue(queue))));queue&&queue.d<0&&(queue.d=0)}})();
/* webpack/runtime/define property getters */
(()=>{
// define getter functions for harmony exports
__webpack_require__.d=(exports,definition)=>{for(var key in definition)__webpack_require__.o(definition,key)&&!__webpack_require__.o(exports,key)&&Object.defineProperty(exports,key,{enumerable:true,get:definition[key]})}})();
/* webpack/runtime/hasOwnProperty shorthand */
(()=>{__webpack_require__.o=(obj,prop)=>Object.prototype.hasOwnProperty.call(obj,prop)})();
// startup
// Load entry module and return exports
// This entry module used 'module' so it can't be inlined
__webpack_require__(388)})();