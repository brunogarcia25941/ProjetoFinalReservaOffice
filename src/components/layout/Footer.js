    import React, { useState } from 'react';
    import { Link } from 'react-router-dom';
    import Modal from '../ui/Modal'; // Importar o modal comum do projeto

    /**
     * Componente do rodapé global com suporte integrado a modais de termos e políticas.
     */
    function Footer() {
      // Estado para controlar qual modal legal está ativo ('privacy' | 'terms' | 'cookies' | null)
      const [activeLegalModal, setActiveLegalModal] = useState(null);

      // Retorna o título e corpo com o conteúdo legal detalhado e formal em conformidade com o RGPD
      const getLegalContent = () => {
        switch (activeLegalModal) {
          case 'privacy':
            return {
              title: 'Política de Privacidade e Proteção de Dados (RGPD)',
              content: (
                <div className="space-y-4 text-xs sm:text-sm text-gray-600 max-h-[60vh] overflow-y-auto pr-2 text-left leading-relaxed">
                  <p className="font-bold text-gray-800 text-base border-b pb-1">1. Enquadramento e Responsabilidade</p>
                  <p>O tratamento de dados pessoais no âmbito do Reserva Office é realizado em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD - Regulamento (UE) 2016/679) e demais legislação nacional aplicável.</p>

                  <p className="font-bold text-gray-800 text-base border-b pb-1">2. Dados Pessoais Tratados</p>
                  <p>Para o correto funcionamento do sistema, recolhemos e tratamos os seguintes dados pessoais fornecidos pelo utilizador ou pela empresa:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Dados de Identificação:</strong> Nome completo, endereço de correio eletrónico corporativo e fotografia de perfil (se aplicável).</li>
                    <li><strong>Dados Operacionais:</strong> Histórico de reservas, recursos alocados (mesas, salas e periféricos), convites de reuniões e relatórios de avarias técnicas.</li>
                    <li><strong>Dados de Acesso e Segurança:</strong> Credenciais de acesso cifradas, logs de auditoria (IP, data/hora e ações realizadas) e dados do dispositivo (user-agent).</li>
                  </ul>

                  <p className="font-bold text-gray-800 text-base border-b pb-1">3. Finalidades do Tratamento</p>
                  <p>Os dados recolhidos destinam-se exclusivamente às seguintes finalidades:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Gestão, alocação e otimização dos espaços físicos de trabalho e recursos técnicos do escritório.</li>
                    <li>Garantia da segurança física das instalações e auditoria interna em caso de incidentes.</li>
                    <li>Envio de comunicações automáticas de suporte, confirmações e alertas de cancelamento de reservas.</li>
                  </ul>

                  <p className="font-bold text-gray-800 text-base border-b pb-1">4. Direitos do Titular dos Dados</p>
                  <p>Nos termos da legislação em vigor, é garantido ao utilizador o direito de aceder aos seus dados, solicitar a retificação de dados incorretos, requerer a eliminação (direito ao esquecimento) ou opor-se ao tratamento de segurança. Para exercer estes direitos, deverá contactar o departamento de administração/suporte através do email corporativo.</p>

                  <p className="font-bold text-gray-800 text-base border-b pb-1">5. Segurança dos Dados</p>
                  <p>A plataforma adota medidas técnicas e organizativas adequadas para proteger os dados contra a destruição acidental, perda, alteração ou acesso não autorizado, incluindo cifragem de palavras-passe na base de dados (`bcrypt`) e ligações encriptadas (HTTPS).</p>
                </div>
              )
            };
          case 'terms':
            return {
              title: 'Termos e Condições de Utilização',
              content: (
                <div className="space-y-4 text-xs sm:text-sm text-gray-600 max-h-[60vh] overflow-y-auto pr-2 text-left leading-relaxed">
                  <p className="font-bold text-gray-800 text-base border-b pb-1">1. Objeto e Condições de Acesso</p>
                  <p>A presente plataforma Reserva Office é de uso exclusivo dos colaboradores ativos e autorizados da empresa. O acesso é pessoal, intransmissível e requer credenciais válidas.</p>

                  <p className="font-bold text-gray-800 text-base border-b pb-1">2. Regras de Reserva e Utilização Responsável</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>As reservas de mesas e salas estão limitadas a uma antecedência máxima de 30 dias e a uma duração contínua de 1 mês.</li>
                    <li>Reservas recorrentes (diárias/semanais) estão limitadas a um máximo de 30 ocorrências por série.</li>
                    <li><strong>Dever de Libertação:</strong> Se o utilizador não pretender utilizar o recurso reservado, tem o dever de desmarcar ou concluir a reserva antecipadamente para permitir a utilização por outros colegas.</li>
                  </ul>

                  <p className="font-bold text-gray-800 text-base border-b pb-1">3. Responsabilidade sobre Equipamentos</p>
                  <p>O utilizador é responsável pela conservação dos equipamentos associados ao recurso reservado (monitores, cabos e periféricos). Qualquer anomalia ou dano verificado deve ser reportado de imediato através do painel de **Ocorrências** da plataforma.</p>

                  <p className="font-bold text-gray-800 text-base border-b pb-1">4. Modificações e Cancelamentos Administrativos</p>
                  <p>A equipa de suporte ou os administradores reservam-se o direito de realocar utilizadores ou cancelar reservas confirmadas em caso de manutenção urgente do edifício ou reorganização operacional dos espaços. </p>
                </div>
              )
            };
          case 'cookies':
            return {
              title: 'Política de Cookies e Armazenamento Local',
              content: (
                <div className="space-y-4 text-xs sm:text-sm text-gray-600 max-h-[60vh] overflow-y-auto pr-2 text-left leading-relaxed">
                  <p className="font-bold text-gray-800 text-base border-b pb-1">1. Utilização de Tecnologias de Armazenamento</p>
                  <p>O Reserva Office recorre a pequenos ficheiros de texto guardados no navegador do utilizador (Cookies e Armazenamento Local - `localStorage`) para otimizar a experiência de utilização e manter a integridade da sessão.</p>

                  <p className="font-bold text-gray-800 text-base border-b pb-1">2. Cookies e Armazenamento Estritamente Necessários</p>
                  <p>Utilizamos estas tecnologias exclusivamente para fins técnicos:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Autenticação:</strong> Guardar o token de sessão (JWT) e o refresh token para manter o utilizador autenticado de forma segura.</li>
                    <li><strong>Preferências:</strong> Memorizar o edifício/escritório padrão selecionado no topo da barra de navegação para evitar reconfigurações constantes.</li>
                  </ul>

                  <p className="font-bold text-gray-800 text-base border-b pb-1">3. Cookies de Terceiros e Rastreio</p>
                  <p>Esta plataforma **não utiliza** quaisquer cookies analíticos, promocionais, publicitários ou de rastreio de terceiros (como redes sociais ou motores de pesquisa), garantindo um ecossistema seguro e privado.</p>
                </div>
              )
            };
          default:
            return { title: '', content: null };
        }
      };

      const modalDetails = getLegalContent();

      return (
        <footer className="bg-white border-t border-gray-200 mt-12 py-8 font-sans w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

              {/* Descrição */}
              <div className="flex flex-col space-y-3 text-left">
                <span className="text-lg font-bold text-gray-800 tracking-tight">Reserva Office</span>
                <p className="text-xs text-gray-500 max-w-sm">
                  Gestão inteligente e simplificada de espaços de trabalho, salas de reunião e equipamentos no seu escritório.
                </p>
              </div>

              {/* Links Legais */}
              <div className="flex flex-col space-y-3 text-left">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Políticas e Termos</h4>
                <ul className="space-y-2 text-xs font-medium text-gray-600">
                  <li>
                    <button onClick={() => setActiveLegalModal('privacy')} className="hover:text-primary transition- colors cursor-pointer bg-transparent border-0 p-0 text-left outline-none">
                      Política de Privacidade
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveLegalModal('terms')} className="hover:text-primary transition- colors cursor-pointer bg-transparent border-0 p-0 text-left outline-none">
                      Termos de Utilização
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveLegalModal('cookies')} className="hover:text-primary transition- colors cursor-pointer bg-transparent border-0 p-0 text-left outline-none">
                      Definições de Cookies
                    </button>
                  </li>
                </ul>
              </div>

              {/* Suporte */}
              <div className="flex flex-col space-y-3 text-left">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Suporte</h4>
                <ul className="space-y-2 text-xs font-medium text-gray-600">
                  <li>
                    <Link to="/tickets" className="hover:text-primary transition-colors">
                      Reportar Ocorrência
                    </Link>
                  </li>
                  <li>
                    <span className="text-gray-500 block">suporte@softinsa.pt</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Linha Inferior */}
            <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap- 4">
              <p className="text-[11px] text-gray-400">
                &copy; {new Date().getFullYear()} Reserva Office. Todos os direitos reservados.
              </p>
              <span className="text-[10px] text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100 font-mono">
                versão de desenvolvimento
              </span>
            </div>
          </div>

          {/* Modal Genérico que exibe o conteúdo legal baseado no estado */}
          <Modal
            isOpen={activeLegalModal !== null}
            onClose={() => setActiveLegalModal(null)}
            title={modalDetails.title}
            maxWidth="max-w-lg"
          >
            {modalDetails.content}
          </Modal>
        </footer>
      );
    }

    export default Footer;