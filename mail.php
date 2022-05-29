<?php
if(isset($_POST['submit'])) {
  echo "form had submit";
  //get data from form  
  $name = $_POST['name'];
  $email= $_POST['email'];
  $project = $_POST['project'];
  $message= $_POST['message'];
  $to = "dat54261001@mail.com";
  $subject = "Mail From BuiHuuDat Website with project " . $project;
  $txt ="Name = ". $name .
  "\r\n  Email = " . $email . 
  "\r\n Project =" . $project . 
  "\r\n Message =" . $message;

  $headers = "From: " . $email . "\r\n";
  if($email!=NULL){
      mail($to,$subject,$txt,$headers);
  }
  //redirect
  // header("Location:thankyou.html");
}
?>