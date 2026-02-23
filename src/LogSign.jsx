import {useState, useEffect} from "react";

function LogSign({onAuthSuccess}) {
    const [mode, setMode] = useState(null);
    const [realName, setRealName] = useState("");
    const [role, setRole] = useState("student");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        const cached = localStorage.getItem("authUser");
        if (cached) {
            const user = JSON.parse(cached);
            setStatus(`Welcome back ${user.realName}`);
        }
    }, []);

    const sendAuth = async () => {
        const url =
            mode === "signup"
                ? "http://localhost:5001/signup"
                : "http://localhost:5001/login";

        setStatus("Checking...");

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    realName,
                    role,
                    username,
                    password
                })
            });

            const data = await res.json();

            if (data.ok) {
                const userCache = {
                    realName: data.realName || realName,
                    role: data.role || role,
                    username
                };
                localStorage.setItem("authUser", JSON.stringify(userCache));
                onAuthSuccess(userCache);

                setStatus(
                    mode === "signup"
                        ? "Account created successfully"
                        : "Login successful"
                );
            } else {
                setStatus("Invalid credentials");
            }
        } catch (err) {
            console.error(err);
            setStatus("Server error");
        }
    };

    return (
        <div id="Scene">
            <div id="LSmainCon" className={mode ? "moveBack" : ""}>
                <div id="WelText">
                    <p>Welcome Users, Please Log In or Sign Up to Continue</p>
                </div>

                <div id="LogSignCon">
                    <button onClick={() => setMode("login")}>Log In</button>
                    <button onClick={() => setMode("signup")}>Sign Up</button>
                </div>
            </div>

            <div id="AuthCard" className={mode ? "showCard" : ""}>
                <h2>{mode === "signup" ? "Sign Up" : "Log In"}</h2>

                {mode === "signup" && (
                    <>
                        <input
                            type="text"
                            placeholder="Real Name"
                            value={realName}
                            onChange={(e) => setRealName(e.target.value)}
                        />

                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </>
                )}

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button onClick={sendAuth}>
                    {mode === "signup" ? "Create Account" : "Enter"}
                </button>

                {status && <p id="AuthStatus">{status}</p>}
            </div>
        </div>
    );
}

export default LogSign;