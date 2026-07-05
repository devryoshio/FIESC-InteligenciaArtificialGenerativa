Quase! O seu backend está **100% preparado** e de braços abertos para receber o frontend, mas precisamos ajustar as "pontes" do lado do React.

Se você tentar rodar agora, o frontend ainda vai usar aquele `setTimeout` (o atraso simulado de 1,5 segundos) que escrevemos antes. Precisamos trocar essa simulação por uma requisição real via `fetch` apontando para o seu servidor FastAPI (`http://localhost:8000`).

Para fazer essa mágica acontecer e ver os dados do banco na tela, precisamos atualizar a função de envio dentro das duas telas.

---

### Passo 1: Conectar a Tela de Login

Abra o arquivo **`src/pages/Login.jsx`**. Procure pela função `handleLogin` (por volta da linha 11) e **substitua aquela função antiga por esta versão real**:

```javascript
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Faz a chamada real para o seu FastAPI
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Se o FastAPI devolver erro (401, por exemplo), joga pro bloco catch
        throw new Error(data.detail || 'Erro ao fazer login.');
      }

      // SUCESSO: Salva o token falso no navegador e vai para o Dashboard
      localStorage.setItem('token', data.token);
      navigate('/dashboard');

    } catch (error) {
      // Exibe o erro real do banco de dados (Ex: "E-mail ou senha incorretos")
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

```

---

### Passo 2: Conectar a Tela de Cadastro

Agora abra o arquivo **`src/pages/Register.jsx`**. Procure pela função `handleRegister` (também por volta da linha 12) e **substitua por esta**:

```javascript
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Envia os dados para salvar no SQLite
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Se o e-mail já existir, o FastAPI vai avisar e cairá aqui
        throw new Error(data.detail || 'Erro ao criar conta.');
      }

      // SUCESSO: Avisa o usuário e o joga para a tela de login
      alert('Conta criada com sucesso! Agora é só fazer o login.');
      navigate('/login');

    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

```

---

### Passo 3: O Teste de Fogo 🔥

Agora que os dois lados falam a mesma língua, vamos ver o sistema funcionando de ponta a ponta:

1. Certifique-se de que o **Backend** está rodando em um terminal (`uvicorn main:app --reload`).
2. Certifique-se de que o **Frontend** está rodando em outro terminal (`npm run dev`).
3. Abra o seu navegador no Frontend (`http://localhost:5173`).
4. Clique em **"Cadastre-se"**, preencha um nome, e-mail e senha novos e clique em "Começar a Praticar". Se tudo der certo, você verá o alerta de sucesso e será jogado para o Login.
5. Na tela de Login, tente digitar uma senha errada para ver o banco te barrar. Depois digite a certa e veja ele te deixar entrar no Dashboard!

Conseguiu rodar os dois servidores ao mesmo tempo e fazer o seu primeiro cadastro real salvando direto no SQLite?