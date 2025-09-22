import React from "react";
import styles from "./AuthPage.module.sass";
import TextInput from "./../../components/TextInput/TextInput";
import Button from "../../components/Button/Button";
import { useState, useEffect } from "react";
import { login, register } from "../../api/api";     
import moment from "moment"; 
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserDetails } from "../../store/userSlice";
import { useIsMobile } from "../../hooks/useIsMobile";
import { FaCalendarCheck } from "react-icons/fa";
import { showToast } from "../../components/Toast/Toast";

function AuthPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const tabs = [
        {
        key: "about",
        label: "About",
        title: "All-in-one Platform",
        body:
            "Organize your work, collaborate securely, and stay productive with a clean, accessible UI. Built for speed and simplicity.",
        },
        {
        key: "features",
        label: "Features",
        title: "Simple, Fast, Secure",
        body:
            "Powered by React and Redux with responsive, accessible components. Enjoy a delightful developer and user experience.",
        },
    ];

    const [activeIndex, setActiveIndex] = useState(0);
    const [registerFormData, setRegisterFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        dob: moment(),
    });

    const [loginFormData, setLoginFormData] = useState({
        email: "",
        password: "",
    });

    // Right container auth tab: login or signup
    const [authTab, setAuthTab] = useState("login"); // "login" | "signup"
    const isMobile = useIsMobile();

    async function handleLogin() {
        let toast;
        try {
            toast = showToast("Logging in", null, true);
            const response = await login(loginFormData);
            console.log("Login successful:", response);
            localStorage.setItem("jwtToken", response.data.token);
            dispatch(setUserDetails(response.data.user));
            localStorage.setItem("userDetails", JSON.stringify(response.data.user));
            toast.update(false, "Login success", "success");
            navigate("/appointment")
        }
        catch(error){
            toast.update(false, "Login failed", "failure");
            console.error("Error in handleLogin:", error);
        }
    }

    async function handleRegister() {
        let toast;
        try {
            toast = showToast("Registering user", null, true);
            const response = await register({...registerFormData, firstName: registerFormData.name, lastName: ''});
            console.log("Register successful:", response);
            toast.update(false, "Successfully registered", "success");
        }
        catch(error){
            toast.update(false, "Failed to register", "failure");
            console.error("Error in handleRegister:", error);
        }
    }

    return <div className={styles.authPage}>
        { <div className={styles.leftContainer}>
            <div className={styles.logo}>
                <FaCalendarCheck style={{width: 25, height: 25}}/>
                <h1>QuickBook</h1>
            </div>
            <div className={styles.leftTabs}>
                <div
                    id={`panel-${tabs[activeIndex].key}`}
                    role="tabpanel"
                    aria-labelledby={`tab-${tabs[activeIndex].key}`}
                    className={styles.tabPanel}
                >
                    <h4 className={styles.tabTitle}>{tabs[activeIndex].title}</h4>
                    <p className={styles.tabBody}>{tabs[activeIndex].body}</p>
                </div>
                <div className={styles.tabList} role="tablist" aria-label="About the app">
                    {tabs.map((t, i) => {
                        const isActive = i === activeIndex;
                        return (
                            <button
                            key={t.key}
                            id={`tab-${t.key}`}
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`panel-${t.key}`}
                            aria-label={t.label}
                            title={t.label}
                            tabIndex={isActive ? 0 : -1}
                            className={`${styles.tabButton} ${isActive ? styles.active : ""}`}
                            onClick={() => setActiveIndex(i)}
                            type="button"
                            />
                        );
                    })}
                </div>
            </div>
        </div>}
        <div className={styles.rightContainer}>
            <div className={styles.rightContainerCard}>
                {authTab === "login" ? (
                    <div
                        id="auth-panel-login"
                        role="tabpanel"
                        aria-labelledby="auth-tab-login"
                        className={styles.tabPanel}
                    >
                        <h1>Login</h1>
                        <form>
                            <div className={styles.formContainer}>
                                <TextInput 
                                    id="email" 
                                    name="email" 
                                    type="email" 
                                    label="Email" 
                                    placeholder="you@example.com" 
                                    fullWidth 
                                    value={loginFormData.email} 
                                    onChange={(e) => setLoginFormData({ ...loginFormData, email: e.target.value })}/>
                                <TextInput 
                                    id="password" 
                                    name="password" 
                                    type="password" 
                                    label="Password" 
                                    placeholder="••••••••" 
                                    fullWidth 
                                    value={loginFormData.password} 
                                    onChange={(e) => setLoginFormData({ ...loginFormData, password: e.target.value })}/>
                                <Button 
                                    type="button"
                                    onClick={handleLogin}
                                >
                                    Login
                                </Button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div
                        id="auth-panel-signup"
                        role="tabpanel"
                        aria-labelledby="auth-tab-signup"
                        className={styles.tabPanel}
                    >
                        <h1>Sign up</h1>
                        <form>
                            <div className={styles.formContainer}>
                                <TextInput 
                                    id="name" 
                                    name="name" 
                                    type="text" 
                                    label="Full name" 
                                    placeholder="Jane Doe" 
                                    fullWidth 
                                    value={registerFormData.name} 
                                    onChange={(e) => setRegisterFormData({ ...registerFormData, name: e.target.value })}
                                    />
                                <TextInput 
                                    id="dob" 
                                    name="dob" 
                                    type="date" 
                                    label="dob" 
                                    placeholder="DD MMM YYYY" 
                                    fullWidth 
                                    displayValue={moment(registerFormData.dob).format('DD MMM YYYY')}
                                    value={registerFormData.dob} 
                                    onChange={(e) => setRegisterFormData({ ...registerFormData, dob: e.target.value })}/>
                                <TextInput 
                                    id="email" 
                                    name="email" 
                                    type="email" 
                                    label="Email" 
                                    placeholder="you@example.com" 
                                    fullWidth 
                                    value={registerFormData.email} 
                                    onChange={(e) => setRegisterFormData({ ...registerFormData, email: e.target.value })}/>
                                <TextInput 
                                    id="password" 
                                    name="password" 
                                    type="password" 
                                    label="Password" 
                                    placeholder="••••••••" 
                                    fullWidth 
                                    value={registerFormData.password} 
                                    onChange={(e) => setRegisterFormData({ ...registerFormData, password: e.target.value })}/>
                                <TextInput 
                                    id="confirmPassword" 
                                    name="confirmPassword" 
                                    type="password" 
                                    label="Confirm password" 
                                    placeholder="••••••••" 
                                    fullWidth 
                                    value={registerFormData.confirmPassword} 
                                    onChange={(e) => setRegisterFormData({ ...registerFormData, confirmPassword: e.target.value })}/>
                                <Button 
                                    type="button"
                                    onClick={handleRegister}
                                    >
                                    Create account
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
                {
                  authTab === "login" ? (
                    <div className={styles.divider} role="presentation">
                      <span>New to QuickBook? </span>
                      <Button
                        type="button"
                        variant="link"
                        className={styles.linkButton}
                        onClick={() => setAuthTab("signup")}
                      >
                        Register
                      </Button>
                    </div>
                  ) : (
                    <div className={styles.divider} role="presentation">
                      <span>Already have an account? </span>
                      <Button
                        type="button"
                        className={styles.linkButton}
                        variant="link"
                        onClick={() => setAuthTab("login")}
                      >
                        Login
                      </Button>
                    </div>
                  )
                }

            </div>
        </div>
    
    </div>
}

export default AuthPage;