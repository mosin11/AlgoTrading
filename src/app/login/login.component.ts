import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../api.service';  // Import your ApiService if needed
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment.prod';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule]
  // Include imports if using standalone component
  
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  otpForm: FormGroup;
  showOtpForm = false;
  otpControls: string[] = Array(4).fill('').map((_, index) => `otp${index}`);


  constructor(private fb: FormBuilder, private router: Router, private apiService: ApiService) {
     this.loginForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', Validators.required]
    });
    this.otpForm = this.fb.group(
      this.otpControls.reduce((controls, controlName) => {
        controls[controlName] = ['', Validators.required];
        return controls;
      }, {} as { [key: string]: any })
    );

  }

  isInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName) || this.otpForm.get(controlName);
    return control?.invalid && (control?.touched || control?.dirty) || false;
  }

  ngOnInit(): void {
    // No need to initialize the form again here
  }

   
  async onSubmit() {
    if (this.loginForm.valid) {
      const phoneNumber = '+91' + this.loginForm.get('phoneNumber')?.value; // Prepend country code
      const password = this.loginForm.get('password')?.value;
      try {
        const response = await this.apiService.authenticate(phoneNumber, password).toPromise();
        
        console.log(response.data);
        if (response.success) {
          localStorage.removeItem("token");
          localStorage.removeItem("sid");
          localStorage.removeItem("accessToken");

          localStorage.setItem("token",response.token);
          localStorage.setItem("sid",response.sid);
          localStorage.setItem("accessToken",response.accessToken);
          
          this.showOtpForm = true;
          this.loginForm.reset(); // Show OTP form on successful login
        }
      } catch (error) {
        console.log('Error:', error);
      }
      
    }
  }
  

  async onOtpSubmit() {
    if (this.otpForm.valid) {
      const otp = this.otpControls.map(controlName => this.otpForm.get(controlName)?.value).join('');
        try {
        const response = await this.apiService.verifyOtp(otp).toPromise();
        
        if (response.success) {
          localStorage.setItem("authToken",response.data.token);
          localStorage.removeItem("sid");
          localStorage.setItem("sid",response.data.sid);
          localStorage.setItem("rid",response.data.rid);
          console.log('OTP verified successfully');
          this.router.navigate(['/dashboard']);
          // Handle successful OTP verification (e.g., redirect to dashboard)
        }
      } catch (error) {
        console.log('Error:', error);
      }
    }
  }



  onOtpKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
  
    if (event.key === 'Backspace') {
      if (!value && index > 0) {
        // Move focus to the previous input if backspace is pressed and the current input is empty
        const prevInput = (input.parentElement?.children[index - 1] as HTMLInputElement) || null;
        if (prevInput) {
          prevInput.focus();
        }
      }
    }
  }
  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
  
    if (value && index < this.otpControls.length - 1) {
      // Move focus to the next input if value is entered and it's not the last input
      const nextInput = (input.parentElement?.children[index + 1] as HTMLInputElement) || null;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }
    
  
}
