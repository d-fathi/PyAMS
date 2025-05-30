

const logoContainer = document.getElementById('logo-container');
const logoUrl = logoContainer.getAttribute('data-logo-url');

const dataHtml={
    title:`
         <div class="logo">
	          <img  alt="User Image" src="${logoUrl}">
            <span>PyAMS: Python for analog and mixed signals</span> &nbsp&nbsp&nbsp [<span id="caption"> </span>]
		    </div>
        <div class="user-info menu-item-user" >
            <span id="spanuser">Login</span>
			      <img alt="User Image" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAC6UlEQVR4nO2ZXWiOYRjHf+ZzxLAkiQOfs1lTlEU5UEI7c4BoDsbJEFpKdkTKjnzswFdKDtd8TU4wiinNwcpnYhxoSGJMiLG9uvR/67byvs/7PrP7Vu+v7qP3vv7P/36f5/64rhty5PjvmAGsB/YC9cBBoBZYCgwhcAYDVcBDIJGiPQOWECiTgNuO2VdAI3AIqFGzN/NEv38FjgCLCIixjsGnQAUw6C9984ADfd5QAzCSADgtQ21AQYT+NphiYAfwVrHn8cxU4CfwAyjLIn4a0KnBrMAjm2XiXAyNPc4n5o0LMrExhsYcaTzHI60yUR5z2f4G9Pqc9O0aSFFMnS7p2ArohccyMDumzhfpjMETN2Ugzk49Xhqf8UiDTKyNobFQGvfxSK1M1MXQ2CmNY3hkuUxcj6FxSRrr8MhKmfiU5fF8GPBRGhV45IZM7EpxUEyFxeyWxjU8klx+szlnJSmTxiM8ckYmLKHKlk3SaMQjG2TihZKnTKlRrGlU4hE7J53VOalLuUZU8pyjiZ2eTcs7d2WoJIOYUsXYPAuGepnan0FMnWKOExDzZcqyvQkRz1fvFbOYwGiSMdtbClP0Gw1cUd9mAmQy8CZColWkPrajTydQ2iIMpNgp1AXLgwgDSeboHQRMu0zOTVNCSqimFSQTleWZySkp+hVoA/2uQQVFKXBPg7gcoX+jsxkuIABKlNl1O7VfK2ino9Cp2lul8hQwjwHGEqhVygp7ZaZHNeBMyjm2n5xUbLKgfQtYDQz9h/4ZAWx1TqsJlXFOpJnc6bBV7Kgzv6y9BLYD+f3o/3cWV6U7j+SD7LPYBozrx+cUAFucuWbttfKVbLLPPxgFXHSEWweoar6sz8VRk7xkxXCgRULvgDUMPJXOJ9eiYkXGHHZ24Fn4Xdo75MVuuzJipi5velQJ9E25vHTrxjgy+/QPXCUcmuXJrrwjc0dB1YRDtbPgROZDmrtyn60z6iDyAzCbSNNsc86RIwfR+AUnligdzeBw0AAAAABJRU5ErkJggg==" alt="user--v1">
            <div class="dropdown" id="dropdownUser">
            </div>
        </div>`,

    dropdownLogin:` <div class="dropdown-item" onclick="login()">
                        <img src=" " alt="Warning">Login
                    </div>
                    <div class="dropdown-item" onclick="signUp()">
                        <img src=" " alt="Chat">Sign up
                    </div>
                    <div class="dropdown-item">
                        <img src=" " alt="Calendar">Opt8
                    </div>`,

    dropdownLogOut:` <div class="dropdown-item"  onclick="logout()">
                        <img src=" " alt="Warning">Logout
                     </div>
                     <div class="dropdown-item" onclick="profile()">
                        <img src=" " alt="Chat">Profile
                     </div>
                     <div class="dropdown-item">
                        <img src=" " alt="Calendar">Opt8
                    </div>`,
                    
    message:`
     <div id="login-form" style=" position: fixed; width: 350px; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; border: 1px solid #ddd;  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); z-index: 1000;">
        <div class="title-bar">
	        <div class="logo">
	        <img  alt="User Image" src="${logoUrl}">
            <span>Message</span>
		      </div>
        </div>

        <div action="/action_page.php" method="post" style="padding:20px;">
          <div class="container">
            <p id="msg"></p>
         </div>

         <div class="container" id="userDialog">
          <button type="button" class="cancelbtn button2"  onclick="document.getElementById('id_model').style.display = 'none'">Ok</button>
         </div>
       </div>
    </div>`,

    newCircuit:`
            <button type="button" class="buttonOkCancel"  onclick="document.getElementById('id_model').style.display = 'none'; newCircuit();">Ok</button>
            <button type="button" class="buttonOkCancel"  onclick="document.getElementById('id_model').style.display = 'none'">Cancel</button>`,
        
    newSymbol:`
            <button type="button" class="buttonOkCancel"  onclick="document.getElementById('id_model').style.display = 'none'; newSymbol();">Ok</button>
            <button type="button" class="buttonOkCancel"  onclick="document.getElementById('id_model').style.display = 'none'">Cancel</button>`,

    openFile:`
            <button type="button" class="buttonOkCancel"  onclick="document.getElementById('id_model').style.display = 'none'; openFile();">Ok</button>
            <button type="button" class="buttonOkCancel"  onclick="document.getElementById('id_model').style.display = 'none'">Cancel</button>`,
     
    login:`
     <div id="login-form" style=" position: fixed; width: 350px; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; border: 1px solid #ddd;  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); z-index: 1000;">
        <div class="title-bar">
	        <div class="logo">
	        <img  alt="User Image" src="${logoUrl}">
            <span>Login</span>
		      </div>
        </div>

        <form id="dataFormLogin" style="padding:20px;">

          <div>
            <p id="errorMessage" style="color: red;"></p>
          </div>

          <div class="container">
            <label for="email"><b>Email</b></label>
            <input class="input-user" type="email" placeholder="Enter Email" id="email" required>

             <label for="psw"><b>Password</b></label>
            <input  class="input-user"  type="password" placeholder="Enter Password" id="password" required>
        
            <button type="submit" class="button2">Login</button>
            <label>
            <input  type="checkbox" checked="checked" id="remember"> Remember me
           </label>
         </div>

         <div class="container">
          <button type="button" class="cancelbtn button2"  onclick="document.getElementById('id_model').style.display = 'none'">Cancel</button>
           <div class="link-container">
            <a href="#" class="link-left" onclick="signUp()">Sign up</a>
            <a href="#" class="link-right">Forgot password?</a>
           </div>
         </div>

       </form>
    </div>`,

  signUp:`
      <div id="singup-form" style=" position: fixed; width: 350px; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; border: 1px solid #ddd;  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); z-index: 1000;">
        
        <div class="title-bar">
	        <div class="logo">
	          <img  alt="User Image" src="${logoUrl}">
             <span>Sign up</span>
		      </div>
        </div>
          
        <form id="dataFormSignUp" style="padding:20px;">
          <div>
            <p>Please fill in this form to create an account.</p>
            <hr>
            <p id="responseMessageSignUp"></p>
            <p id="errorMessage" style="color: red;"></p>
          </div>

          <div class="container">
            <label for="uname"><b>Username</b></label>
            <input class="input-user" type="text" placeholder="Enter Username" id="username" required>

            <label for="email"><b>Email</b></label>
            <input class="input-user" type="email" placeholder="Enter Email" id="email" required>

            <label for="psw"><b>Password</b></label>
            <input class="input-user" type="password" placeholder="Enter Password" id="password" required>

            <label for="rpsw"><b>Repeat Password</b></label>
            <input class="input-user" type="password" placeholder="Enter Repeat Password" id="repeatPassword" required>
        
            <button type="submit" class="button2">Sign up</button>
          </div>

         <div class="container">
           <button type="button" class="cancelbtn button2"  onclick="document.getElementById('id_model').style.display = 'none'">Cancel</button>
         </div>
        
        </form>
      </div>`,

  openfrom:`
    <div id="open-form" style=" position: fixed; width: 350px; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; border: 1px solid #ddd;  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); z-index: 1000;">
      
      <div class="title-bar">
        <div class="logo">
          <img  alt="User Image" src="${logoUrl}">
           <span>Open</span>
           
        </div>
      </div>
        
      <form id="files-form" style="padding:20px;">
        <div class="container">
          <label for="file-name"><b>Directory</b></label>
          <select class="input-user" id="directory"  onchange="getFilesFromSelect()">
             <option value="demo" selected>demo</option>
          </select>
        </div>

         <div class="container">
          <input type="radio" name="gender_vsd" id="file_dsc" value="dsc" checked onclick="getFilesFromSelect()">Circuit files (*dsc)  
          <input type="radio" name="gender_vsd" id="file_sym" value="sym" onclick="getFilesFromSelect()">Symbol files(*.sym)
         </div>

         <br>
         <div class="container">
          <label for="files"><b>Files</b></label>
          <div  style="border: 1px solid #ccc;  box-sizing: border-box; height: 220px; overflow: scroll;">
           <ul id="file-list" class="ul-files">

           <ul>
          </div>
        </div>

       <br>
       <div class="container">
         <button type="submit" class="buttonOkCancel">Open</button>
         <button type="button" class="cancelbtn buttonOkCancel"  onclick="document.getElementById('id_model').style.display = 'none'">Cancel</button>
       </div>
      
      </form>
    </div>`,
    allDir:`
       <option value="demo">demo</option>
       <option value="user" selected>user</option>
    `,
    
    savefrom:`
    <div id="save-form" style=" position: fixed; width: 350px; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; border: 1px solid #ddd;  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); z-index: 1000;">
      
      <div class="title-bar">
        <div class="logo">
          <img  alt="User Image" src="${logoUrl}">
           <span>Save file as</span>
        </div>
      </div>
      
          <div>
            <p id="errorMessage" style="color: red;"></p>
          </div>
        
      <form id="files-form" style="padding:20px;">
        <div class="container">
          <label for="file-name"><b>File name</b></label>
          <input class="input-user" id="fileName">
          
          <label for="files"><b>Files</b></label>
          <div  style="border: 1px solid #ccc;  box-sizing: border-box; height: 220px; overflow: scroll;">
             <ul id="file-list" class="ul-files">

             </ul>
          </div>

      
          <button type="submit" class="button2">Save</button>
        </div>

       <div class="container">
         <button type="button" class="cancelbtn button2"  onclick="document.getElementById('id_model').style.display = 'none'">Cancel</button>
       </div>
      
      </form>
    </div>`
}

