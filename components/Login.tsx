
import React, { useState, useEffect } from 'react';
import { UserSession, RegisteredUser } from '../types';

interface Props {
  onLogin: (user: UserSession) => void;
}

type ViewState = 'login' | 'register' | 'forgot' | 'reset';

const Login: React.FC<Props> = ({ onLogin }) => {
  const [view, setView] = useState<ViewState>('login');
  const [users, setUsers] = useState<RegisteredUser[]>(() => {
    const saved = localStorage.getItem('app_users');
    return saved ? JSON.parse(saved) : [];
  });

  // Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Recovery States
  const [foundUser, setFoundUser] = useState<RegisteredUser | null>(null);

  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!username.trim() || !password.trim()) {
      setError('Por favor, preencha o usuário e a senha.');
      return;
    }

    // ADM Bypass (Protocolo de mestre)
    if (password === 'TerryCrews') {
      onLogin({ username: username || 'Admin', role: 'ADM' });
      return;
    }

    // Busca estrita no banco de usuários registrados
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    
    if (user) {
      onLogin({ username: user.username, role: 'VISITANTE' });
    } else {
      // Mensagem gentil para usuários não registrados
      const userExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
      if (userExists) {
        setError('Senha incorreta. Tente novamente ou use a recuperação de senha.');
      } else {
        setError('Não encontramos seu registro. Por favor, crie uma conta para acessar o sistema.');
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!username.trim() || !password.trim() || !securityQuestion.trim() || !securityAnswer.trim()) {
      setError('Todos os campos são obrigatórios para sua segurança.');
      return;
    }

    if (password.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      setError('Este nome de usuário já está sendo utilizado.');
      return;
    }

    const newUser: RegisteredUser = { username, password, securityQuestion, securityAnswer };
    setUsers([...users, newUser]);
    setSuccess('Registro concluído com sucesso! Agora você pode entrar.');
    setView('login');
    // Mantém o username para facilitar o login imediato
    setPassword('');
  };

  const handleForgotSearch = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      setFoundUser(user);
      setView('reset');
    } else {
      setError('Não localizamos nenhum usuário com este nome.');
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (securityAnswer.toLowerCase() === foundUser?.securityAnswer.toLowerCase()) {
      if (password !== confirmPassword) {
        setError('As novas senhas não coincidem.');
        return;
      }
      
      const updatedUsers = users.map(u => 
        u.username === foundUser.username ? { ...u, password: password } : u
      );
      setUsers(updatedUsers);
      setSuccess('Senha atualizada! Utilize sua nova senha para entrar.');
      setView('login');
      setPassword('');
      setConfirmPassword('');
    } else {
      setError('A resposta de segurança está incorreta.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden transition-all duration-500">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-4 animate-in zoom-in duration-500">
            <i className={`fas ${view === 'register' ? 'fa-user-plus' : view === 'login' ? 'fa-lock' : 'fa-shield-alt'} text-2xl`}></i>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white uppercase text-center">
            {view === 'login' ? 'Estoque Pro' : view === 'register' ? 'Novo Registro' : 'Recuperação'}
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-bold uppercase tracking-widest text-center">
            {view === 'login' ? 'Identifique-se para continuar' : view === 'register' ? 'Crie sua conta de acesso' : 'Validação de Segurança'}
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-[11px] font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <i className="fas fa-info-circle text-sm"></i>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-[11px] font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <i className="fas fa-check-circle text-sm"></i>
            {success}
          </div>
        )}

        {/* LOGIN VIEW */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="text"
                placeholder="Nome de Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            <div>
              <input 
                type="password"
                placeholder="Senha de Acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95">
              ENTRAR NO SISTEMA
            </button>
            <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-slate-800">
              <button 
                type="button"
                onClick={() => { setView('register'); resetMessages(); }}
                className="text-xs font-black text-slate-400 hover:text-blue-400 uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                <span>Não possui conta?</span>
                <span className="text-blue-500 underline decoration-2 underline-offset-4">Registre-se agora</span>
              </button>
              <button 
                type="button"
                onClick={() => { setView('forgot'); resetMessages(); }}
                className="text-[10px] font-black text-slate-500 hover:text-red-400 uppercase tracking-widest transition-colors"
              >
                Esqueci minha senha
              </button>
            </div>
          </form>
        )}

        {/* REGISTER VIEW */}
        {view === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <input 
              type="text"
              placeholder="Defina seu Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-800 border-none rounded-2xl py-3 px-6 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-800 border-none rounded-2xl py-3 px-6 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
              <input 
                type="password"
                placeholder="Confirmar"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-800 border-none rounded-2xl py-3 px-6 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Protocolo de Recuperação</label>
              <input 
                type="text"
                placeholder="Pergunta: Ex: Nome da sua mãe?"
                value={securityQuestion}
                onChange={(e) => setSecurityQuestion(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-2xl py-3 px-6 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
              <input 
                type="text"
                placeholder="Sua Resposta Secreta"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-2xl py-3 px-6 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95">
              FINALIZAR REGISTRO
            </button>
            <button 
              type="button"
              onClick={() => { setView('login'); resetMessages(); }}
              className="w-full text-xs font-black text-slate-500 hover:text-slate-300 uppercase tracking-widest mt-2"
            >
              Já sou registrado
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD VIEW (SEARCH) */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotSearch} className="space-y-4">
            <p className="text-xs text-slate-400 text-center mb-4 leading-relaxed">
              Informe seu usuário para validarmos sua pergunta de segurança.
            </p>
            <input 
              type="text"
              placeholder="Digite seu Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
            />
            <button className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-black rounded-2xl transition-all active:scale-95">
              VERIFICAR IDENTIDADE
            </button>
            <button 
              type="button"
              onClick={() => { setView('login'); resetMessages(); }}
              className="w-full text-xs font-black text-slate-500 hover:text-slate-300 uppercase tracking-widest mt-2"
            >
              Voltar
            </button>
          </form>
        )}

        {/* RESET PASSWORD VIEW */}
        {view === 'reset' && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 mb-2">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Confirme sua Resposta:</p>
              <p className="text-sm font-bold text-blue-400 italic">"{foundUser?.securityQuestion}"</p>
            </div>
            <input 
              type="text"
              placeholder="Escreva sua resposta aqui"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              className="w-full bg-slate-800 border-none rounded-2xl py-3 px-6 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="password"
                placeholder="Nova Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-800 border-none rounded-2xl py-3 px-6 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <input 
                type="password"
                placeholder="Repetir Senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-800 border-none rounded-2xl py-3 px-6 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95">
              SALVAR NOVA SENHA
            </button>
            <button 
              type="button"
              onClick={() => { setView('login'); resetMessages(); }}
              className="w-full text-xs font-black text-slate-500 hover:text-slate-300 uppercase tracking-widest mt-2"
            >
              Cancelar
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] leading-relaxed">
            ACESSO PROTEGIDO E MONITORADO<br/>
            © ESTOQUE PRO INTELIGENTE
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
