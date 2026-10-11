function hello(name) {
  const greeting = "안녕하세요, " + name + "님";
  if (name === undefined) {
    return "이름이 없어요";
  }
  console.log(greeting);
  return greeting;
}

hello("세상");
