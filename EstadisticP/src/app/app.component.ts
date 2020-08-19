import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth, User } from 'firebase/app';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'EstadisticP';
  usuario: User;
  formularioLogin: FormGroup;
  formularioRegistro: FormGroup;
  datosCorrectos = true;
  textoError = '';
  noRegistrado = false;

  constructor(public ofAuth: AngularFireAuth, private creadorFormulario: FormBuilder) {
    this.formularioLogin = this.creadorFormulario.group({
      email: ['', Validators.compose([
        Validators.required, Validators.email
      ])],
      password: ['', Validators.required]
    });

    this.formularioRegistro = this.creadorFormulario.group({
      email: ['', Validators.compose([
        Validators.required, Validators.email
      ])],
      password: ['', Validators.required]
    });

    this.ofAuth.user.subscribe(
      (res) => {
        this.usuario = res;
      }
    );
  }

  logearse()
  {
    if (this.formularioLogin.valid)
    {
      this.datosCorrectos = true;
      this.ofAuth.signInWithEmailAndPassword(this.formularioLogin.value.email, this.formularioLogin.value.password)
      .then((usuario) => {
        console.log(usuario);
      }).catch((error) => {
        this.datosCorrectos = false;
        this.textoError = error.message;
      });
    }
    else
    {
      this.datosCorrectos = false;
      this.textoError = 'Revisa tus datos.';
     }
  }

  registrarse() {
    {
      if (this.formularioRegistro.valid)
      {
        this.datosCorrectos = true;
        this.ofAuth.createUserWithEmailAndPassword(this.formularioRegistro.value.email, this.formularioRegistro.value.password)
        .then((usuario) => {
          console.log(usuario);
        }).catch((error) => {
          this.datosCorrectos = false;
          this.textoError = error.message;
        });
      }
      else
      {
        this.datosCorrectos = false;
        this.textoError = 'Revisa tus datos.';
      }
    }
  }

  logout() {
    this.ofAuth.signOut();
  }
}
