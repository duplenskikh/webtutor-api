import axios from "axios";

async function update() {
  const { data } = await axios.get("https://github.com/umbrik/webtutor-api/releases/latest");
  console.log(data);
}

update();
