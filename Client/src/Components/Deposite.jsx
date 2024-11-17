import Button from '@mui/material/Button';
import { useState } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import {Eye,EyeOff} from 'lucide-react'
import { toast } from 'react-toastify';


export default function Deposite(props) {

    let [user,setUser]=useState({amount:"",username:"",password:""})
    let name, value;

    const handleInputs = (e) => {
        e.preventDefault();
        name = e.target.name;
        value = e.target.value;

        setUser({ ...user, [name]: value })
    }

    const submit=async (e)=>{
        e.preventDefault();
        const toastId = toast.loading("Waiting for confirmation...", {
            position: "top-center",
          });
        const {amount,username,password}=user;
        await axios.post(`${props.api}/deposite`,user)
        .then(res=>{
            if(res.data==="InvalidU")
            {
                toast.dismiss(toastId);
                toast.info('Invalid Username!', {
                    position: "top-center",
                    });
            }
            else if(res.data==="InvalidP")
                {
                    toast.dismiss(toastId);
                    toast.info('Invalid Password!', {
                        position: "top-center",
                        });
                }
            else
            {
                toast.dismiss(toastId);
                toast.info('Deposite Successfully.Your current amount is: '+res.data, {
                    position: "top-center",
                    });
            }
        })
        .catch(err=>console.log(err))

        setUser(
            {amount:"",username:"",password:""}
        )
    }

    const [passwordVisible, setPasswordVisible] = useState(false);

    const handlePasswordVisibilityToggle = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <div className="container8">
            <h1 className='mainhead'>Welcome to Deposite Page</h1>
            <form onSubmit={submit}>
                <div className="balinfo">
                    <label for="exampleFormControlInput1" class="form-label">Enter Amount:  </label>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <input type="number" name="amount" class="form-control form2" id="exampleFormControlInput1" value={user.amount} onChange={handleInputs} autoComplete="off" required/>
                </div>
                <div className="balinfo">
                    <label for="exampleFormControlInput2" class="form-label">Enter Username:  </label>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <input type="name" name="username" class="form-control form2" id="exampleFormControlInput2" value={user.username} onChange={handleInputs} autoComplete="off" required/>
                </div>
                <div className="balinfo">
                    <label for="exampleFormControlInput3" class="form-label">Enter Password:  </label>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <div className="pass">
                    <input type={passwordVisible ? 'text' : 'password'} name="password" class="form-control form2" id="exampleFormControlInput3" value={user.password} onChange={handleInputs} autoComplete="off" required/>
                    <button type="button" onClick={handlePasswordVisibilityToggle} className="eye-icon3 cursor-pointer">
                        {passwordVisible ? <Eye/>:<EyeOff/>}
                    </button>
                    </div>
                </div>

                <Button type="submit" variant="outlined" id="balbtn" >Submit</Button>
              <hr />
            </form>
            <Button variant="outlined" id="homebtn" href="/" >Logout</Button>
            <NavLink to="/admdashboard" ><Button variant="outlined" id="homebtn" >Go to main dashboard</Button></NavLink>
        </div>
    )
}